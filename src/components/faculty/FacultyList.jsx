import { useEffect, useState } from "react";

import EditFacultyDialog from "./EditFacultyDialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";


function FacultyList({ refresh }) {

    const [faculty, setFaculty] = useState([]);
    const [search, setSearch] = useState("");

    const [editFaculty, setEditFaculty] = useState(null);

    const [deleteFacultyId, setDeleteFacultyId] = useState(null);
    const [deleteFacultyName, setDeleteFacultyName] = useState("");

    const [loading, setLoading] = useState(false);


    // =========================================================
    // FETCH FACULTY
    // =========================================================

    const fetchFaculty = async () => {

        try {

            setLoading(true);

            const response = await fetch(
                "http://localhost:8000/faculty"
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch faculty"
                );
            }

            const data = await response.json();

            console.log("FACULTY:", data);

            setFaculty(data);

        } catch (error) {

            console.error(
                "FETCH FACULTY ERROR:",
                error
            );

            toast.error(error.message);

        } finally {

            setLoading(false);

        }
    };


    // =========================================================
    // LOAD FACULTY
    // =========================================================

    useEffect(() => {

        fetchFaculty();

    }, [refresh]);


    // =========================================================
    // DELETE FACULTY
    // =========================================================

    const deleteFaculty = async (id) => {

        if (id === null || id === undefined) {

            toast.error(
                "Faculty ID missing"
            );

            return;
        }

        try {

            const response = await fetch(
                `http://localhost:8000/faculty/${id}`,
                {
                    method: "DELETE",
                }
            );

            let data = null;

            try {

                data = await response.json();

            } catch {

                data = null;

            }

            if (!response.ok) {

                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Failed to delete faculty"
                );

            }

            toast.success(
                "Faculty deleted successfully"
            );

            await fetchFaculty();

        } catch (error) {

            console.error(
                "DELETE FACULTY ERROR:",
                error
            );

            toast.error(
                error.message
            );

        }
    };


    // =========================================================
    // SEARCH
    // =========================================================

    const filteredFaculty = faculty.filter(
        (teacher) => {

            const text = search
                .toLowerCase()
                .trim();

            if (!text) {
                return true;
            }

            return (
                teacher.name
                    ?.toLowerCase()
                    .includes(text) ||

                teacher.subject
                    ?.toLowerCase()
                    .includes(text) ||

                teacher.email
                    ?.toLowerCase()
                    .includes(text)
            );

        }
    );


    // =========================================================
    // OPEN DELETE
    // =========================================================

    const openDelete = (teacher) => {

        setDeleteFacultyId(
            teacher.id
        );

        setDeleteFacultyName(
            teacher.name
        );

    };


    // =========================================================
    // CANCEL DELETE
    // =========================================================

    const cancelDelete = () => {

        setDeleteFacultyId(null);

        setDeleteFacultyName("");

    };


    // =========================================================
    // CONFIRM DELETE
    // =========================================================

    const confirmDelete = async () => {

        const id = deleteFacultyId;

        setDeleteFacultyId(null);
        setDeleteFacultyName("");

        await deleteFaculty(id);

    };


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="space-y-4">

            {/* SEARCH */}

            <Input
                placeholder="Search Faculty..."
                value={search}
                onChange={(e) =>
                    setSearch(e.target.value)
                }
            />


            {/* EDIT */}

            {editFaculty && (

                <EditFacultyDialog
                    faculty={editFaculty}
                    close={() =>
                        setEditFaculty(null)
                    }
                    refresh={fetchFaculty}
                />

            )}


            {/* TABLE */}

            <div className="overflow-hidden rounded-lg border">

                <Table>

                    <TableHeader>

                        <TableRow>

                            <TableHead>
                                Faculty Name
                            </TableHead>

                            <TableHead>
                                Subject
                            </TableHead>

                            <TableHead>
                                Email
                            </TableHead>

                            <TableHead>
                                Action
                            </TableHead>

                        </TableRow>

                    </TableHeader>


                    <TableBody>

                        {/* LOADING */}

                        {loading ? (

                            <TableRow>

                                <TableCell
                                    colSpan={4}
                                    className="py-8 text-center"
                                >
                                    Loading faculty...
                                </TableCell>

                            </TableRow>

                        ) : filteredFaculty.length === 0 ? (

                            /* EMPTY */

                            <TableRow>

                                <TableCell
                                    colSpan={4}
                                    className="py-8 text-center"
                                >
                                    {search
                                        ? "No faculty found"
                                        : "No faculty added yet"}
                                </TableCell>

                            </TableRow>

                        ) : (

                            /* DATA */

                            filteredFaculty.map(
                                (teacher) => (

                                    <TableRow
                                        key={teacher.id}
                                    >

                                        <TableCell className="font-medium">
                                            {teacher.name}
                                        </TableCell>

                                        <TableCell>
                                            {teacher.subject}
                                        </TableCell>

                                        <TableCell>
                                            {teacher.email || "—"}
                                        </TableCell>

                                        <TableCell>

                                            <div className="flex gap-2">

                                                {/* EDIT */}

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() =>
                                                        setEditFaculty(
                                                            teacher
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </Button>


                                                {/* DELETE */}

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        openDelete(
                                                            teacher
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </Button>

                                            </div>

                                        </TableCell>

                                    </TableRow>

                                )
                            )

                        )}

                    </TableBody>

                </Table>

            </div>


            {/* DELETE CONFIRMATION */}

            {deleteFacultyId !== null && (

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
                >

                    <div
                        className="
                            w-full
                            max-w-md
                            rounded-xl
                            border
                            bg-background
                            p-6
                            shadow-2xl
                        "
                    >

                        <h2 className="text-xl font-semibold">
                            Delete Faculty?
                        </h2>


                        <p className="mt-3 text-sm text-muted-foreground">

                            Are you sure you want to delete{" "}

                            <span className="font-semibold text-foreground">
                                {deleteFacultyName}
                            </span>

                            ?

                            <br />

                            This action cannot be undone.

                        </p>


                        <div className="mt-6 flex justify-end gap-3">

                            <Button
                                type="button"
                                variant="outline"
                                onClick={cancelDelete}
                            >
                                Cancel
                            </Button>


                            <Button
                                type="button"
                                variant="destructive"
                                onClick={confirmDelete}
                            >
                                Delete
                            </Button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );
}


export default FacultyList;