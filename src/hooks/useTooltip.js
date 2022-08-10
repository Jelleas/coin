import React, { useState } from "react";
import styled from "styled-components";
import { Overlay } from "react-overlays";

const Tooltip = styled("div")`
    position: absolute;
    background: #2196f3;
`;

const Arrow = styled("div")`
    position: absolute;
    width: 10px;
    height: 10px;
    z-index: -1;

    &::before {
        content: "";
        position: absolute;
        transform: rotate(45deg);
        background: #2196f3;
        width: 10px;
        height: 10px;
        top: 0;
        left: 0;
    }

    ${(p) =>
        ({
            left: "right: -4px;",
            right: "left: -4px;",
            top: "bottom: -4px;",
            bottom: "top: -4px;",
        }[p.placement])}
`;

const Body = styled("div")`
    padding: 3px 8px;
    color: #fff;
    text-align: center;
    border-radius: 3px;
`;

function useTooltip(containerRef, placement) {
    const [show, setShow] = useState(false);
    const [target, setTarget] = useState(null);
    const [content, setContent] = useState("");

    const tooltip = (
        <Overlay
            show={show}
            rootClose
            offset={[0, 10]}
            onHide={() => setShow(false)}
            container={containerRef}
            target={target}
            placement={placement}
        >
            {({ props, arrowProps }) => (
                <Tooltip {...props} placement={placement}>
                    <Arrow
                        {...arrowProps}
                        placement={placement}
                        style={arrowProps.style}
                    />
                    <Body>{content}</Body>
                </Tooltip>
            )}
        </Overlay>
    );

    const showTooltip = (target, content) => {
        setShow(true);
        setTarget(target);
        setContent(content);
    };

    const hideTooltip = () => {
        setShow(false);
    };

    return [tooltip, showTooltip, hideTooltip];
}

export default useTooltip;
