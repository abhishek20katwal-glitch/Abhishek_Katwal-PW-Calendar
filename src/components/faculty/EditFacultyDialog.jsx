import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";


function EditFacultyDialog({
    faculty,
    close,
    refresh,
}) {

    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [email, setEmail] = useState("");

    const [saving, setSaving] = useState(false);


    // =========================================================
    // LOAD FACULTY DATA
    // =========================================================

    useEffect(() => {

        if (!faculty) {
            return;
        }

        setName(faculty.name || "");
        setSubject(faculty.subject || "");
        setEmail(faculty.email || "");

    }, [faculty]);


    if (!faculty) {
        return null;
    }


    // =========================================================
    // UPDATE FACULTY
    // =========================================================

    const updateFaculty = async () => {

        if (!name.trim()) {

            toast.error(
                "Please enter Faculty Name"
            );

            return;
        }


        if (!subject.trim()) {

            toast.error(
                "Please enter Subject"
            );

            return;
        }


        try {

            setSaving(true);


            const response = await fetch(
                `http://localhost:8000/faculty/${faculty.id}`,
                {
                    method: "PUT",

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


            let data = null;


            try {

                data = await response.json();

            } catch {

                data = null;

            }


            console.log(
                "UPDATE FACULTY RESPONSE:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Failed to update faculty"
                );

            }


            toast.success(
                "Faculty updated successfully"
            );


            // Refresh faculty list

            if (refresh) {
                await refresh();
            }


            // Close dialog

            close();


        } catch (error) {

            console.error(
                "UPDATE FACULTY ERROR:",
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

        <div
            className="
                fixed
                inset-0
                z-[9999]
                flex
                items-center
                justify-center
                bg-black/50
                p-4
            "
            onClick={close}
        >

            {/* MODAL */}

            <div
                className="
                    w-full
                    max-w-lg
                    rounded-xl
                    border
                    bg-background
                    p-6
                    shadow-2xl
                "
                onClick={(e) =>
                    e.stopPropagation()
                }
            >

                {/* HEADER */}

                <div className="mb-6">

                    <h2 className="text-xl font-semibold">
                        Edit Faculty
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Update faculty details below.
                    </p>

                </div>


                {/* FORM */}

                <div className="space-y-4">


                    {/* NAME */}

                    <div className="space-y-2">

                        <label className="text-sm font-medium">
                            Faculty Name
                        </label>

                        <Input
                            value={name}
                            disabled={saving}
                            placeholder="Faculty Name"
                            onChange={(e) =>
                                setName(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* SUBJECT */}

                    <div className="space-y-2">

                        <label className="text-sm font-medium">
                            Subject
                        </label>

                        <Input
                            value={subject}
                            disabled={saving}
                            placeholder="Subject"
                            onChange={(e) =>
                                setSubject(
                                    e.target.value
                                )
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
                            value={email}
                            disabled={saving}
                            placeholder="Email"
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* BUTTONS */}

                    <div className="flex justify-end gap-3 pt-4">

                        <Button
                            type="button"
                            variant="outline"
                            disabled={saving}
                            onClick={close}
                        >
                            Cancel
                        </Button>


                        <Button
                            type="button"
                            disabled={saving}
                            onClick={updateFaculty}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </Button>

                    </div>

                </div>

            </div>

        </div>

    );
}


export default EditFacultyDialog;