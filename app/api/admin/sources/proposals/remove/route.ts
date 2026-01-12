import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";
import { EventType, logEvent } from "@/lib/eventLog";
import { hasPermission, RemoveSourceBody } from "@/types";
import { getServerSession } from "next-auth";


export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session.user.permissions, "MANAGE_SOURCES")) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { proposal_id } = await request.json() as RemoveSourceBody;

    if (isNaN(proposal_id)) {
        return new Response("Invalid proposal ID", { status: 400 });
    }

    await pool.query(
        "DELETE FROM source_submission WHERE id = $1",
        [proposal_id]
    );

    logEvent({
        type: EventType.REMOVE_SOURCE_PROPOSAL,
        data: { proposalId: proposal_id },
        userId: session.user.id,
        sourceId: null,
    })

    return new Response("Proposal removed", { status: 200 });
}