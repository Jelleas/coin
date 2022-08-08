import React from "react";

function CourseSelection({ courses, onSelect }) {
    const buttons = courses.map((course) => (
        <CourseSelectionButton
            key={course}
            course={course}
            onClick={() => onSelect(course)}
        />
    ));

    const style = {
        overflow: "scroll",
        marginBottom: "2em",
        marginTop: "1em",
        cursor: "pointer",
        ...getRowStyles(courses),
    };

    return (
        <div style={style}>
            <div></div>
            {buttons}
            <div></div>
        </div>
    );
}

function CourseSelectionButton({ course, onClick }) {
    const style = {
        border: "1px solid black",
        borderRadius: "5px",
        marginRight: "1ch",
        padding: "3px",
        textAlign: "center",
    };

    return (
        <div style={style} onClick={onClick}>
            {course}
        </div>
    );
}

function getRowStyles(courses) {
    return {
        display: "grid",
        gridTemplateColumns: `repeat(${courses.length + 2}, auto)`,
        textAlign: "left",
        overflow: "scroll",
        width: "100%",
    };
}

export default CourseSelection;
