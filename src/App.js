import "./App.css";

import Table from "./components/table";

function App() {
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

    return <Table students={students} slugs={slugs}></Table>;
}

export default App;
