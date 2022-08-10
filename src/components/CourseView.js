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

    return [resultData, isLoading, error];
}

function getCourses() {
    if (IN_DEVELOPMENT) {
        const slowPromise = new Promise((resolve) => {
            setTimeout(() => resolve(), 1000);
        });

        const coursesPromise = import("../mock_data/courses.json").then(
            (courses) => {
                return Array.from(courses);
            }
        );

        return Promise.all([coursesPromise, slowPromise]).then(([courses]) => {
            return courses;
        });
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
