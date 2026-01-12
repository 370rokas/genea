import { EventType, logEvent } from "@/lib/eventLog";
import { pushNotifTask } from "@/lib/notifs";

pushNotifTask()
    .then(() => {
        logEvent({
            type: EventType.PUSH_EMAILS,
            data: null,
            userId: null,
            sourceId: null,
        })

        console.log("Notification push task completed.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error in notification push task:", error);
        process.exit(1);
    });

