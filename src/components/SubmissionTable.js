import React, { useEffect, useReducer, useRef } from "react";

import Spinner from "./Spinner";

import useSWR from "swr";

const IN_DEVELOPMENT = process.env.NODE_ENV === "development";

function SubmissionTable({ course }) {
    const [{ students, slugs, submissions }, isLoading] =
        useSubmissions(course);

    const { sort, dispatchSort, sortedBy } = useSort(submissions);

    if (slugs.length === 0 && isLoading) {
        return <Spinner />;
    }

    const studentToSubmissions = getStudentsToSubmissions(submissions);

    const rows = sort(students).map((student) => (
        <StudentRow
            key={student}
            student={student}
            submissions={studentToSubmissions[student]}
        />
    ));

    return (
        <>
            {isLoading && <Spinner />}
            <div style={getRowStyles(students, slugs)}>
                <Header
                    slugs={slugs}
                    onClick={dispatchSort}
                    sortedBy={sortedBy}
                />
                {rows}
            </div>
        </>
    );
}

function Header({ slugs, onClick, sortedBy }) {
    const style = {
        paddingTop: "3px",
        paddingBottom: "3px",
        marginBottom: "1ch",
        borderBottom: "1px solid black",
        cursor: "pointer",
    };

    const studentHeader = (
        <div
            onClick={() => onClick("student")}
            key="student"
            style={{ ...style, textAlign: "center" }}
        >
            student
            {sortedBy.type === "student" ? (
                <>
                    <Caret asc={sortedBy.asc} />
                    <span style={{ visibility: "hidden" }}>
                        <Caret asc={true} />
                    </span>
                </>
            ) : (
                <UnsortedCarets />
            )}
        </div>
    );

    const slugHeaders = [...slugs].map((slug) => (
        <div onClick={() => onClick(slug)} style={style} key={slug}>
            {slug}
            {sortedBy.type === slug ? (
                <Caret asc={sortedBy.asc} />
            ) : (
                <UnsortedCarets />
            )}
        </div>
    ));

    return [studentHeader, ...slugHeaders];
}

function StudentRow({ student, submissions }) {
    const renderedSubmissions = submissions.map((sub) => (
        <Submission key={sub.slug} submission={sub} />
    ));

    return (
        <>
            <div style={{ textAlign: "center" }}>{student}</div>
            {renderedSubmissions}
        </>
    );
}

function Submission({ submission }) {
    const formatScore = (submission) => {
        const width = 7;
        const score = submission.rank[0]?.score;
        if (!score) {
            return " ".repeat(width - 1) + "-";
        }
        const formattedScore = (Math.round(score * 10) / 10).toFixed(1);
        const spaces = " ".repeat(Math.max(7 - formattedScore.length, 0));
        return spaces + formattedScore;
    };

    return (
        <div
            style={{
                marginBottom: "1ch",
                marginRight: "1ch",
            }}
        >
            <pre
                style={{
                    border: "solid black 1px",
                    borderRadius: "3px",
                    padding: "3px",
                    margin: "0",
                    cursor: "pointer",
                    display: "inline-block",
                }}
            >
                {formatScore(submission)}
            </pre>
        </div>
    );
}

function Caret({ asc, filled }) {
    let style = {
        content: "",
        color: "black",
        display: "inline-block",
        width: 0,
        height: 0,
        borderRight: "4px solid transparent",
        borderLeft: "4px solid transparent",
        verticalAlign: "center",
    };

    if (asc) {
        style = { ...style, borderTop: "4px dashed", borderBottom: 0 };
    } else {
        style = { ...style, borderBottom: "4px dashed", borderTop: 0 };
    }

    if (!filled) {
        style = { ...style, color: "#cccccc" };
    }

    return <span style={style}></span>;
}
Caret.defaultProps = {
    filled: true,
};

function UnsortedCarets() {
    return (
        <>
            <Caret asc={true} filled={false} />
            <Caret asc={false} filled={false} />
        </>
    );
}

function useSort(submissions) {
    const reducer = (state, type) => {
        if (state.type === type) {
            return { type: type, asc: !state.asc };
        } else {
            return { type: type, asc: true };
        }
    };
    const [state, dispatch] = useReducer(reducer, {
        type: "student",
        asc: true,
    });

    const sort = (students) => {
        // Sort by student
        if (state.type === "student") {
            if (state.asc) {
                return [...students].sort().reverse();
            } else {
                return [...students].sort();
            }
        }

        // Sort by slug
        const slug = state.type;

        // Get each student's submission to the slug
        const studentToSubmissions = getStudentsToSubmissions(submissions);
        studentToSubmissions.forEach((subs, student) => {
            studentToSubmissions[student] = subs.filter((s) => s.slug === slug);
        });

        // Sort the students by their highest ranking score
        const sortedStudents = [...students].sort((student_a, student_b) => {
            const sub_a = studentToSubmissions[student_a][0];
            const sub_b = studentToSubmissions[student_b][0];

            const score_a = sub_a?.rank[0]?.score;
            const score_b = sub_b?.rank[0]?.score;

            if (score_a === score_b) {
                return 0;
            }
            if (score_a === undefined) {
                return -1;
            }
            if (score_b === undefined) {
                return 1;
            }

            return score_a > score_b ? 1 : -1;
        });

        return state.asc ? sortedStudents.reverse() : sortedStudents;
    };

    return { sort, dispatchSort: dispatch, sortedBy: state };
}

function useSubmissions(course) {
    const fetcher = (...args) => getSubmissions(...args);
    const prevStateRef = useRef();

    const { data, error } = useSWR(`/api/get_submission/${course}`, fetcher);

    useEffect(() => {
        if (data) {
            prevStateRef.current = data;
        }
    });

    const isLoading = !data;

    let resultData = data;
    if (isLoading) {
        // If there is old (stale) data, return that
        if (prevStateRef.current) {
            resultData = prevStateRef.current;
        } // Else return an empty result object
        else {
            resultData = {
                submissions: [],
                students: [],
                slugs: [],
            };
        }
    }

    return [resultData, isLoading, error];
}

function getSubmissions(course) {
    if (IN_DEVELOPMENT) {
        const slowPromise = new Promise((resolve) => {
            setTimeout(() => resolve(), 1000);
        });

        const loadData = import("../mock_data/course.json").then((course) => {
            const students = getStudents(course);
            const slugs = course.slugs.map((slug) => slug.name);
            const submissions = course.slugs
                .map((slug) => {
                    return slug.submitters.map((submitter) => {
                        return {
                            student: submitter.name,
                            version: submitter.submission.version,
                            slug: slug.name,
                            course: course.name,
                            rank: submitter.submission.rank.map((rank) => {
                                return {
                                    student: rank.sub_b.submitter,
                                    slug: rank.sub_b.slug,
                                    version: rank.sub_b.version,
                                    score: rank.score,
                                };
                            }),
                        };
                    });
                })
                .flat();
            // const slugs = [
            //     "2021/mario",
            //     "2022/caesar",
            //     "2022/fifteen",
            //     "2022/speller",
            //     "2022/python",
            //     "2022/adventure",
            //     // "2022/foo",
            //     // "2022/bar",
            //     // "2022/baz",
            //     // "2022/foo2",
            //     // "2022/bar2",
            //     // "2022/baz2",
            //     // "2022/foo3",
            //     // "2022/bar3",
            //     // "2022/baz3",
            //     // "2022/foo4",
            //     // "2022/bar4",
            //     // "2022/baz4",
            // ];

            return { students, slugs, submissions };
        });

        return Promise.all([loadData, slowPromise]).then(([data]) => data);
    }
}

function getStudents(course) {
    let students = course.slugs
        .map((slug) => slug.submitters.map((submitter) => submitter.name))
        .flat();
    students = [...new Set(students)];
    return students;
}

function getRowStyles(students, slugs) {
    const maxStudentLength = Math.max(...students.map((s) => s.length));
    const firstColWidth = Math.min(
        20,
        Math.max(maxStudentLength, "student".length + 2)
    );
    return {
        display: "grid",
        gridTemplateColumns: [
            `${firstColWidth}ch`,
            ...slugs.map((s) => "auto"),
        ].join(" "),
        textAlign: "left",
        overflow: "scroll",
        width: "100%",
    };
}

function getStudentsToSubmissions(submissions) {
    const studentToSubmissions = new Map();
    submissions.forEach((sub) => {
        if (studentToSubmissions.has(sub.student)) {
            studentToSubmissions[sub.student].push(sub);
        } else {
            studentToSubmissions[sub.student] = [sub];
        }
    });
    return studentToSubmissions;
}

export default SubmissionTable;
