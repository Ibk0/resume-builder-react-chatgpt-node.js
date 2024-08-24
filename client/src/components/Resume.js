import React, { useRef } from "react";
import "../index.css";
import ErrorPage from "./ErrorPage";
import { useReactToPrint } from "react-to-print";

const Resume = ({ result }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${result.fullName} Resume`,
    onAfterPrint: () => alert("Print Successful!"),
  });

  if (JSON.stringify(result) === "{}") {
    return <ErrorPage />;
  }

  const replaceWithBr = (string) => {
    return string ? string.replace(/\n/g, "<br />") : "";
  };

  return (
    <>
      <button onClick={handlePrint}>Print Page</button>
      <main className="container" ref={componentRef}>
        <header className="header">
          <div>
            <h1>{result.fullName || "Name not available"}</h1>
            <p className="resumeTitle headerTitle">{result.currentPosition}</p>
            <p className="resumeTitle">
              {result.currentLength} year(s) work experience
            </p>
          </div>
          <div>
            <img
              src={result.image_url || "default-image.png"}
              alt={result.fullName || "Profile"}
              className="resumeImage"
            />
          </div>
        </header>
        <div className="resumeBody">
          <div>
            <h2 className="resumeBodyTitle">PROFILE SUMMARY</h2>
            <p
              dangerouslySetInnerHTML={{
                __html: replaceWithBr(result.objective),
              }}
              className="resumeBodyContent"
            />
          </div>
          <div>
            <h2 className="resumeBodyTitle">WORK HISTORY</h2>
            {result.workHistory.map((work, index) => (
              <p className="resumeBodyContent" key={index}>
                <span style={{ fontWeight: "bold" }}>{work.name}</span> -{" "}
                {work.position}
              </p>
            ))}
          </div>
          <div>
            <h2 className="resumeBodyTitle">JOB PROFILE</h2>
            <p
              dangerouslySetInnerHTML={{
                __html: replaceWithBr(result.jobResponsibilities),
              }}
              className="resumeBodyContent"
            />
          </div>
          <div>
            <h2 className="skillsTitle">Skills</h2>
            <p
              dangerouslySetInnerHTML={{
                __html: replaceWithBr(result.currentTechnologies),
              }}
              className="resumeBodyContent"
            />
          </div>
          <div>
            <h2 className="resumeBodyTitle">JOB RESPONSIBILITIES</h2>
            <p
              dangerouslySetInnerHTML={{
                __html: replaceWithBr(result.keypoints),
              }}
              className="resumeBodyContent"
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default Resume;
