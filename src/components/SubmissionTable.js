import React, { useContext, useEffect, useReducer, useRef } from "react";

import Spinner from "./Spinner";
import useTooltip from "../hooks/useTooltip";

import useSWR from "swr";

const IN_DEVELOPMENT = process.env.NODE_ENV === "development";

// number of characters visible
const SUBMISSION_WIDTH = 15;

const TooltipContext = React.createContext();

function SubmissionTable({ course }) {
    const [{ students, slugs, submissions }, isLoading] =
        useSubmissions(course);

    const { sort, dispatchSort, sortedBy } = useSort(submissions);
    const containerRef = useRef(null);

    const [tooltip, showTooltip, hideTooltip] = useTooltip(
        containerRef,
        "right"
    );

    if (slugs.length === 0 && isLoading) {
        return <Spinner />;
    }

    // console.log(
    //     submissions
    //         .filter((s) => s.rank[0] !== undefined)
    //         .map((s) => parseFloat(s.rank[0].score))
    //         .sort((a, b) => (a === b ? 0 : a < b ? 1 : -1))
    // );

    const getWeights = (studentSubmissions, slugToMaxScore) => {
        return studentSubmissions.map((studentSub) => {
            const score =
                studentSub.rank[0] === undefined ? 0 : studentSub.rank[0].score;
            return score / slugToMaxScore.get(studentSub.slug);
        });
    };

    const studentToSubmissions = getStudentsToSubmissions(submissions);

    const slugToMaxScore = getSlugToMaxScore(submissions);

    const rows = sort(students).map((student) => {
        return (
            <StudentRow
                key={student}
                student={student}
                submissions={studentToSubmissions.get(student)}
                weights={getWeights(
                    studentToSubmissions.get(student),
                    slugToMaxScore
                )}
            />
        );
    });

    return (
        <TooltipContext.Provider value={[showTooltip, hideTooltip]}>
            {isLoading && <Spinner />}
            <div ref={containerRef} style={getRowStyles(students, slugs)}>
                {tooltip}
                <Header
                    slugs={slugs}
                    onClick={dispatchSort}
                    sortedBy={sortedBy}
                />
                {rows}
            </div>
        </TooltipContext.Provider>
    );
}

function Header({ slugs, onClick, sortedBy }) {
    const style = {
        paddingTop: "3px",
        paddingBottom: "3px",
        paddingRight: "1ch",
        marginBottom: "1ch",
        borderBottom: "1px solid black",
    };

    const getCaret = (sorted, asc) => {
        if (sorted) {
            return (
                <>
                    <Caret asc={asc} />
                    <span style={{ visibility: "hidden" }}>
                        <Caret asc={true} />
                    </span>
                </>
            );
        } else {
            return <UnsortedCarets />;
        }
    };

    const studentHeader = (
        <div
            key="student"
            style={{
                ...style,
                textAlign: "center",
            }}
        >
            <pre
                onClick={() => onClick("student")}
                style={{
                    display: "inline-block",
                    margin: 0,
                    cursor: "pointer",
                }}
            >
                student
                {getCaret(sortedBy.type === "student", sortedBy.asc)}
            </pre>
        </div>
    );

    const slugHeaders = [...slugs].map((slug) => (
        <div style={{ ...style }} key={slug}>
            <pre
                onClick={() => onClick(slug)}
                style={{
                    maxWidth: `${SUBMISSION_WIDTH - 1}ch`,
                    margin: 0,
                    display: "inline-block",
                    wordBreak: "break-all",
                    whiteSpace: "pre-line",
                    cursor: "pointer",
                }}
            >
                {slug}
                {getCaret(sortedBy.type === slug, sortedBy.asc)}
            </pre>
        </div>
    ));

    return [studentHeader, ...slugHeaders];
}

function StudentRow({ student, submissions, weights }) {
    const renderedSubmissions = submissions.map((sub, i) => (
        <Submission key={sub.slug} submission={sub} weight={weights[i]} />
    ));

    return (
        <>
            <pre
                style={{
                    textAlign: "center",
                    display: "inline-block",
                    margin: 0,
                    padding: "4px",
                }}
            >
                {student}
            </pre>
            {renderedSubmissions}
        </>
    );
}

function Submission({ submission, weight }) {
    const formatScore = (submission) => {
        const width = SUBMISSION_WIDTH;
        const score = submission.rank[0]?.score;
        if (!score) {
            return " ".repeat(width - 1) + "-";
        }
        const formattedScore = (Math.round(score * 10) / 10).toFixed(1);
        const spaces = " ".repeat(Math.max(width - formattedScore.length, 0));
        return spaces + formattedScore;
    };

    const ref = useRef();

    const [showTooltip, hideTooltip] = useContext(TooltipContext);

    const fillWidth = weight * SUBMISSION_WIDTH;

    return (
        <div
            style={{
                marginBottom: "1ch",
                marginRight: "1ch",
            }}
        >
            <pre
                ref={ref}
                style={{
                    boxShadow: `inset calc(${fillWidth}ch + 6px) 0px 0px 0px #ccc`,
                    border: "solid black 1px",
                    borderRadius: "3px",
                    padding: "3px",
                    margin: "0",
                    cursor: "pointer",
                    display: "inline-block",
                    width: `${SUBMISSION_WIDTH}ch`,
                }}
                data-tip="foo"
                data-for="submission-table"
                data-place="right"
                onMouseEnter={() =>
                    showTooltip(
                        ref,
                        submission.rank.map((r) => (
                            <div>
                                {r.student} {r.score}
                            </div>
                        ))
                    )
                }
                onMouseLeave={() => hideTooltip()}
                onClick={() => {
                    console.log("comparing:", submission.payload);
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
        const studentToSub = new Map();
        studentToSubmissions.forEach((subs, student) => {
            studentToSub.set(
                student,
                subs.find((s) => s.slug === slug)
            );
        });

        // Sort the students by their highest ranking score
        const sortedStudents = [...students].sort((student_a, student_b) => {
            const sub_a = studentToSub.get(student_a);
            const sub_b = studentToSub.get(student_b);

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
    const fetcher = (...args) => getSubmissions(course, ...args);
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

        const loadData = import(`../mock_data/${course}.json`).then(
            (course) => {
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
                                payload: submitter.submission.rank,
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
            }
        );

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

    const studentColWidth = `${firstColWidth}ch`;
    const slugColWidths = slugs
        .map((s, i) => (i !== slugs.length - 1 ? "auto" : "1fr"))
        .join(" ");
    const colWidths = `${studentColWidth} ${slugColWidths}`;

    return {
        display: "grid",
        gridTemplateColumns: colWidths,
        textAlign: "left",
        overflow: "scroll",
        width: "100%",
    };
}

function getStudentsToSubmissions(submissions) {
    return _getFieldToObjects(submissions, "student");
}

function getSlugToSubmissions(submissions) {
    return _getFieldToObjects(submissions, "slug");
}

function getSlugToMaxScore(submissions) {
    function getMaxScore(scores) {
        const sum = (arr) => arr.reduce((a, b) => a + b, 0);

        const mean = (arr) => sum(arr) / arr.length;

        const max = (arr) => arr.reduce((a, b) => (a > b ? a : b), 0);

        const std = (arr) => {
            const mu = mean(arr);
            const diffArr = arr.map((a) => (a - mu) ** 2);
            return Math.sqrt(sum(diffArr) / (arr.length - 1));
        };

        // Filter out any scores > mean + 3 * std
        const filterVal = mean(scores) + 3 * std(scores);
        const newScores = scores.filter((val) => val <= filterVal);

        return max(newScores);
    }

    const slugToSubmissions = getSlugToSubmissions(submissions);
    const slugToMaxScore = new Map();

    slugToSubmissions.forEach((submissions, slug) => {
        const maxScore = getMaxScore(
            submissions
                .filter((sub) => sub.rank[0] !== undefined)
                .map((sub) => sub.rank[0].score)
        );

        slugToMaxScore.set(slug, maxScore);
    });

    return slugToMaxScore;
}

function _getFieldToObjects(objects, field) {
    const fieldToObjects = new Map();
    objects.forEach((obj) => {
        const key = obj[field];
        if (fieldToObjects.has(key)) {
            fieldToObjects.get(key).push(obj);
        } else {
            fieldToObjects.set(key, [obj]);
        }
    });
    return fieldToObjects;
}

export default SubmissionTable;
