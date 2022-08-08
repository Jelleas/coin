import React, { useEffect, useReducer, useState } from "react";

function SubmissionTable({ course }) {
    const [students, setStudents] = useState([]);
    const [slugs, setSlugs] = useState([]);
    const { sort, dispatchSort, sortedBy } = useSort();

    useEffect(() => {
        getSubmissions(course).then(([students, slugs]) => {
            setStudents(students);
            setSlugs(slugs);
        });
    }, [course]);

    if (students.length === 0) {
        return <div></div>;
    }

    const rows = sort(students).map((student) => (
        <StudentRow key={student} student={student} slugs={slugs} />
    ));

    return (
        <div style={getRowStyles(students, slugs)}>
            <Header slugs={slugs} onClick={dispatchSort} sortedBy={sortedBy} />
            {rows}
        </div>
    );
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

function Header({ slugs, onClick, sortedBy }) {
    const style = {
        paddingTop: "3px",
        paddingBottom: "3px",
        marginBottom: "1ch",
        borderBottom: "solid black 1px",
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
                <Caret asc={sortedBy.asc} />
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

function StudentRow({ student, slugs }) {
    const submissions = slugs.map((slug) => (
        <Submission key={slug} slug={slug} student={student} />
    ));

    return (
        <>
            <div style={{ textAlign: "center" }}>{student}</div>
            {submissions}
        </>
    );
}

function Submission({ student, slug }) {
    return (
        <div
            style={{
                marginBottom: "1ch",
                marginRight: "1ch",
                cursor: "pointer",
            }}
        >
            <span
                style={{
                    border: "solid black 1px",
                    borderRadius: "3px",
                    padding: "3px",
                    display: "inline-block",
                }}
            >
                {student} submitted {slug}
            </span>
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

function useSort() {
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
        if (state.type === "student") {
            if (state.asc) {
                return [...students].sort();
            } else {
                return [...students].sort().reverse();
            }
        }
        return students;
    };

    return { sort, dispatchSort: dispatch, sortedBy: state };
}

function getSubmissions(course) {
    const promise = new Promise((resolve) => {
        const students = ["id1", "id2", "id3"];

        const slugs = [
            "2021/mario",
            "2022/caesar",
            "2022/fifteen",
            "2022/speller",
            "2022/python",
            "2022/adventure",
            // "2022/foo",
            // "2022/bar",
            // "2022/baz",
            // "2022/foo2",
            // "2022/bar2",
            // "2022/baz2",
            // "2022/foo3",
            // "2022/bar3",
            // "2022/baz3",
            // "2022/foo4",
            // "2022/bar4",
            // "2022/baz4",
        ];

        setTimeout(() => resolve([students, slugs]), 1000);
        // resolve([students, slugs]);
    });
    return promise;
}

export default SubmissionTable;