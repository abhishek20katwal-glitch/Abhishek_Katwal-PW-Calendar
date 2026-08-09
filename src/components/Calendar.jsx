import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const API =
    "https://script.google.com/macros/s/AKfycbzprp8eHdO9ntPCrrRLf8oHM-K6iLDDqMT1lcyUC6IBQp2qEMcx0zkzl0F_8t_nVPWq3w/exec";

export default function Calendar() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch(API);
                const data = await res.json();
                console.log("API DATA", data);

                const calendarEvents = data.map((item, index) => ({
                    id: index,
                    title: `${item.batch || ""} ${item.type || "Test"}`.trim(),

                    // Apps Script date ko JavaScript Date me convert karo
                    date: new Date(item.date),

                    allDay: true,

                    extendedProps: item,
                }));

                setEvents(calendarEvents);
            } catch (err) {
                console.error(err);
            }
        }

        loadData();
    }, []);

    return (
        <div style={{ padding: 20 }}>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                height="85vh"
                events={events}
                eventClick={(info) => {
                    alert(
                        `${info.event.title}\n\n${JSON.stringify(
                            info.event.extendedProps,
                            null,
                            2
                        )}`
                    );
                }}
            />
        </div>
    );
}