import React, {useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import logo from "../../page/image/user_new.png"

function FaceRecognitionImage() {

  const imageRef = useRef(null);

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    const MODEL_URL = "/models";
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  }

  async function detectFace() {
    const image = imageRef.current;
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();

   const labeledDescriptors = await Promise.all(
     [
       "Nguyễn Minh Hiếu",
       "Văn Bảo Tâm",
       "Phan Đức Tiến",
       "Trần Đức Hải",
       "Nguyễn Đăng Khoa",
       "Dương Trung Quốc",
     ].map(async (personName) => {
       const descriptors = await Promise.all(
         Array.from(Array(1).keys()).map(async (__, i) => {
           const imagePath = `/images/${personName}/${i + 1}.jpg`;
           const img = await faceapi.fetchImage(imagePath);
           const detectedFace = await faceapi
             .detectSingleFace(img)
             .withFaceLandmarks()
             .withFaceDescriptor();
           return detectedFace.descriptor;
         })
       );
       return new faceapi.LabeledFaceDescriptors(personName, descriptors);
     })
   );

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
    const canvas = faceapi.createCanvasFromMedia(image);
    document.body.append(canvas);

    detections.forEach((detection) => {
      const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
      const box = detection.detection.box;
      const text = bestMatch.toString();
     const drawOptions = {
       label: text,
       boxColor: "#ff5722",
       textColor: "#212121",
     };

     const drawBox = new faceapi.draw.DrawBox(box, drawOptions);
     drawBox.draw(canvas);
    });
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    if (imageRef.current) {
      imageRef.current.src = imageUrl;
      detectFace();
    }
  }

  return (
    <>
      <h1
        className="mx-auto col-12 text-center pt-4"
        style={{
          color: "#ff9128",

          fontSize: "2.5rem",
        }}
      >
        NHẬN DIỆN KHUÔN MẶT BẰNG ẢNH
      </h1>
      <Col className="col-3 mt-5">
        <Form.Group>
          <Form.Label>
            Nhận diện bằng hình ảnh: <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
          />
        </Form.Group>{" "}
      </Col>
      <Row className="mt-5 pb-5">
        <Col className="col-md-3 col-12">
          {" "}
          <img
            ref={imageRef}
            id="image"
            src={logo}
            alt="Face"
            width="500"
            height="500"
          />
        </Col>
        <Col
          className="col-9 ml-2"
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          {" "}
        </Col>
      </Row>
    </>
  );
}

export default FaceRecognitionImage;
