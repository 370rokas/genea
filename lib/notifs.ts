
import { pool } from "@/lib/db";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend: MailerSend | null = process.env.MAILERSEND_API_KEY ?
    new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY }) : null;

const NOTIFS_PAGE_SIZE = 25;

export interface Notification {
    id: number;
    message: string;
    handled: boolean;

    reply_to: string | null;
    related_source_id: number | null;

    created_at: string;
    last_pushed_at: string;
};

export async function createNotif(message: string, reply_to: string | null = null, related_source_id: number | null = null): Promise<Notification> {
    const res = await pool.query(
        "INSERT INTO notification (message, reply_to, related_source_id) VALUES ($1, $2, $3) RETURNING id, message, handled, reply_to, related_source_id, created_at, last_pushed_at",
        [message, reply_to, related_source_id]
    );

    return res.rows[0] as Notification;
};

export async function pushNotifTask() {
    if (!mailerSend) {
        console.warn("MailerSend API key not configured. Skipping notification push.");
        return;
    }

    // Select unpushed & unhandled notifications
    const notifs: Notification[] = (await pool.query(
        "SELECT id, message, handled, reply_to, related_source_id, created_at, last_pushed_at FROM notification WHERE last_pushed_at IS NULL AND handled = FALSE"
    )).rows;

    if (notifs.length === 0) {
        console.log("No new notifications to push.");
        return;
    }

    // Get recipients
    const recipients: { email: string }[] = (await pool.query(
        "SELECT email FROM notification_recipient WHERE enabled = TRUE"
    )).rows;

    if (recipients.length === 0) {
        console.log("No notification recipients configured. Skipping push.");
        return;
    }

    var emailHtml = "<h2>Nauji pranešimai sistemoje:</h2><ul>";
    notifs.forEach(notif => {
        emailHtml += `<li>${notif.message}</li>`;
    });
    emailHtml += "</ul>";

    const emailRecipients = recipients.map(r => new Recipient(r.email));

    const emailParams = new EmailParams()
        .setFrom(new Sender("noreply@genea.lt", "Genea"))
        .setTo(emailRecipients)
        .setSubject(`Genea - ${notifs.length} nauji pranešimai`)
        .setHtml(emailHtml);

    try {
        await mailerSend.email.send(emailParams);

        // Update last_pushed_at for sent notifications
        const notifIds = notifs.map(n => n.id);

        await pool.query(
            "UPDATE notification SET last_pushed_at = NOW() WHERE id = ANY($1::int[])",
            [notifIds]
        );

        console.log(`Pushed ${notifs.length} notifications to ${recipients.length} recipients.`);
    } catch (error) {
        console.error("Error sending notification emails:", error);
    }

    return;
}

export async function markNotifHandled(notifId: number) {
    await pool.query(
        "UPDATE notification SET handled = TRUE WHERE id = $1",
        [notifId]
    );
}

export async function getNotif(notifId: number): Promise<Notification | null> {
    const res = await pool.query(
        "SELECT id, message, handled, reply_to, related_source_id, created_at, last_pushed_at FROM notification WHERE id = $1",
        [notifId]
    );

    if (res.rowCount === 0) {
        return null;
    }

    return res.rows[0] as Notification;
}

export async function getNotifsPaginated(offset: number = 0, onlyUnhandled: boolean = false): Promise<{ notifs: Notification[]; nextOffset: number | null; }> {
    const query = onlyUnhandled ?
        "SELECT id, message, handled, reply_to, related_source_id, created_at, last_pushed_at FROM notification WHERE handled = FALSE ORDER BY created_at DESC LIMIT $1 OFFSET $2" :
        "SELECT id, message, handled, reply_to, related_source_id, created_at, last_pushed_at FROM notification ORDER BY created_at DESC LIMIT $1 OFFSET $2";

    const res = await pool.query(
        query,
        [NOTIFS_PAGE_SIZE + 1, offset]
    );

    if (!res.rowCount || res.rowCount === 0) {
        return { notifs: [], nextOffset: null };
    }

    const notifs = res.rows.slice(0, NOTIFS_PAGE_SIZE) as Notification[];
    const nextOffset = res.rowCount > NOTIFS_PAGE_SIZE ? offset + NOTIFS_PAGE_SIZE : null;

    return { notifs, nextOffset };
}