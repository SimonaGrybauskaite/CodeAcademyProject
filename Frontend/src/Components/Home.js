import React from "react";
import "../index.css";
import { Link } from "react-router-dom";
import Homesec2 from "./Homesec2";
import AlertContext from "./AlertContext";
import Alert from "./Alert";
function Home() {
  return (
    <div>
      <section>
        <Alert></Alert>
        <div className="bg-down2  mt-4 p-4 ">
          <div className="d-flex justify-content-around main">
            
            <div className="mr-5 mt-5">
              <h1>
                Splitting expenses has
                <br /> become easy
              </h1>
              <ul className="text-3xl">
                <li className="p-3">
                  <i
                    
                    class="fas fa-check-circle  "
                  ></i>{" "}
                  &nbsp;&nbsp;Share bills
                </li>
                <li className="p-3">
                  <i
                    
                    class="fas fa-check-circle"
                  ></i>{" "}
                  &nbsp;&nbsp;Make sure everyone gets equal parts
                </li>
                <li className="p-3">
                  <i
                    
                    class="fas fa-check-circle"
                  ></i>{" "}
                  &nbsp;&nbsp;No Ads
                </li>
              </ul>
              <div className="d-flex justify-content-end">
                <Link
                  to="/Dashboard"
                  className="px-6 py-3 mr-4  shadow rounded-full text-white font-bold 
                  "
                  style={{ backgroundColor: "black", textDecoration: "none" }}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Homesec2 />
    </div>
  );
}

export default Home;

