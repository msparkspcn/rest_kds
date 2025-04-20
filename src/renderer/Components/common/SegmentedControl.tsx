import React, { useRef, useState, useEffect, RefObject } from "react";
import './SegmentedControl.scss';

type Segment = {
    value: string;
    label: string;
    ref: RefObject<HTMLDivElement>;
};

type SegmentedControlProps = {
    name: string;
    segments: Segment[];
    callback: (value: string, index: number) => void;
    defaultIndex?: number;
    controlRef: RefObject<HTMLDivElement>;
};

const SegmentedControl: React.FC<SegmentedControlProps> = ({
                                                               name,
                                                               segments,
                                                               callback,
                                                               defaultIndex = 0,
                                                               controlRef
                                                           }) => {
    const [activeIndex, setActiveIndex] = useState<number>(() => defaultIndex ?? 0);
    const componentReady = useRef<boolean>(false);

    useEffect(() => {
        componentReady.current = true;
    }, []);

    useEffect(() => {
        const activeSegmentRef = segments[activeIndex].ref;
        if (activeSegmentRef.current && controlRef.current) {
            const { offsetWidth, offsetLeft } = activeSegmentRef.current;
            const { style } = controlRef.current;

            style.setProperty("--highlight-width", `${offsetWidth}px`);
            style.setProperty("--highlight-x-pos", `${offsetLeft}px`);
        }
    }, [activeIndex, controlRef, segments]);

    const onInputChange = (value: string, index: number) => {
        setActiveIndex(index);
        callback(value, index);
    };

    return (
      <div className="segment-wrapper" ref={controlRef}>
        <div className={`segment-container ${componentReady.current ? "is-ready" : ""}`}>
          <div
            className="segment-highlight"
            style={{
              width: "var(--highlight-width)",
              transform: "translateX(var(--highlight-x-pos))",
              transition: componentReady.current
                ? "transform 0.3s ease, width 0.3s ease"
                : "none",
            }}
          />
          {segments?.map((item, i) => (
            <div
              key={item.value}
              className={`segment-item ${i === activeIndex ? "is-active" : ""}`}
              ref={item.ref}
            >
              <input
                type="radio"
                value={item.value}
                id={item.label}
                name={name}
                onChange={() => onInputChange(item.value, i)}
                checked={i === activeIndex}
                className="segment-radio"
              />
              <label htmlFor={item.label} className="segment-label">
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>

    );
};

export default SegmentedControl;
