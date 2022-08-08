import React, { useEffect, useState } from "react";
import CourseSelection from "./CourseSelection";
import SubmissionTable from "./SubmissionTable";

function getCourses() {
    const promise = new Promise((resolve) => {
        const courses = [
            "prog1_21_herfst",
            "prog1_21_lente",
            "prog2_21_herfst",
            "prog2_21_lente",
            "prog1_22_herfst",
            "prog1_22_lente",
            "prog2_22_herfst",
            "prog2_22_lente",
        ];

        setTimeout(() => resolve(courses), 1000);
        // resolve(courses);
    });
    return promise;
}

function CourseView() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        getCourses().then((courses) => {
            setCourses(courses);
        });
    }, []);

    return (
        <div>
            <CourseSelection courses={courses} onSelect={setSelectedCourse} />
            {selectedCourse !== null && (
                <SubmissionTable course={selectedCourse} />
            )}
        </div>
    );
}

export default CourseView;
