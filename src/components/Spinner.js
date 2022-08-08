import React from "react";
import { GridLoader } from "react-spinners";

function Spinner() {
    return (
        <GridLoader
            color={"#2196f3"}
            cssOverride={{
                zIndex: -1,
                position: "absolute",
                left: "calc(50vw - 15px)",
                top: "calc(50vh - 15px)",
            }}
        />
    );
}

export default Spinner;
