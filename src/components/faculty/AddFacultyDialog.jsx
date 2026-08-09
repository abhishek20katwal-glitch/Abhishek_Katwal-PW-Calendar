import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";


function AddFacultyDialog({ onSuccess }) {

    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [email, setEmail] = useState("");

    const [saving, setSaving] = useState(false);


    // =========================================================
    // SAVE FACULTY
    // =========================================================

    const saveFaculty = async () => {

        if (!name.trim()) {

            toast.error("Please enter Faculty Name");

            return;
        }


        if (!subject.trim()) {

            toast.error("Please enter Subject");

            return;
        }


        try {

            setSaving(true);


            const response = await fetch(
                "http://localhost:8000/faculty",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        name: name.trim(),
                        subject: subject.trim(),
                        email: email.trim() || null,
                    }),
                }
            );


            const data = await response.json();


            console.log(
                "CREATE FACULTY RESPONSE:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    "Failed to create faculty"
                );
            }


            toast.success(
                "Faculty added successfully"
            );


            // Clear form

            setName("");
            setSubject("");
            setEmail("");


            // Refresh FacultyList

            if (onSuccess) {

                onSuccess();

            }


        } catch (error) {

            console.error(
                "CREATE FACULTY ERROR:",
                error
            );

            toast.error(
                error.message
            );

        } finally {

            setSaving(false);

        }

    };


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="max-w-lg space-y-4 rounded-xl border p-6">


            {/* TITLE */}

            <div>

                <h2 className="text-xl font-semibold">
                    Add Faculty
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Add a new faculty member.
                </p>

            </div>


            {/* NAME */}

            <div className="space-y-2">

                <label className="text-sm font-medium">
                    Faculty Name
                </label>

                <Input
                    placeholder="e.g. Saleem Sir"
                    value={name}
                    disabled={saving}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                />

            </div>


            {/* SUBJECT */}

            <div className="space-y-2">

                <label className="text-sm font-medium">
                    Subject
                </label>

                <Input
                    placeholder="e.g. Physics"
                    value={subject}
                    disabled={saving}
                    onChange={(e) =>
                        setSubject(e.target.value)
                    }
                />

            </div>


            {/* EMAIL */}

            <div className="space-y-2">

                <label className="text-sm font-medium">
                    Email
                </label>

                <Input
                    type="email"
                    placeholder="teacher@example.com"
                    value={email}
                    disabled={saving}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

            </div>


            {/* SAVE */}

            <Button
                type="button"
                disabled={saving}
                onClick={saveFaculty}
            >
                {saving
                    ? "Saving..."
                    : "Add Faculty"}
            </Button>


        </div>

    );

}


export default AddFacultyDialog;