import React, { useEffect, useState, useRef } from "react";
import CourseSelection from "./CourseSelection";
import SubmissionTable from "./SubmissionTable";
import Spinner from "./Spinner";
import useSWR from "swr";

const IN_DEVELOPMENT = process.env.NODE_ENV === "development";

function useCourses() {
    const fetcher = (...args) => getCourses(...args);
    const prevStateRef = useRef();

    const { data, error } = useSWR(`/api/get_courses`, fetcher);

    useEffect(() => {
        if (data) {
            prevStateRef.current = data;
        }
    });

    const isLoading = !data;

    let resultData = data;
    if (isLoading && prevStateRef.current) {
        resultData = prevStateRef.current;
    }

    return [resultData, isLoading];
}

function getCourses() {
    if (IN_DEVELOPMENT) {
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
}

function Title() {
    const style = {
        textAlign: "center",
        color: "#2196f3",
    };
    return <h1 style={style}>compare50</h1>;
}

function CourseView() {
    const [courses, isLoading] = useCourses();
    const [selectedCourse, setSelectedCourse] = useState(null);

    return (
        <div>
            <Title />
            {isLoading ? (
                <Spinner />
            ) : (
                <CourseSelection
                    courses={courses}
                    onSelect={setSelectedCourse}
                />
            )}
            {selectedCourse !== null && (
                <SubmissionTable course={selectedCourse} />
            )}
        </div>
    );
}

export default CourseView;
