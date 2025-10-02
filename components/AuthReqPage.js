import Head from "next/head";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";

import Footer from "./html/Footer";



export const getServerSideProps = async function ({ req, res }) {


  const { user } = req.session
  const control = req.control;
  try {

    control.CheckAccessCore(req, res);
  } catch (error) {
    res.setHeader("location", "/login");
    res.statusCode = 302;
    res.end();
  }

  return {
    props: { user },
  }

}

async function logout(){
  try {
    var res = await fetch("/api/Authentication/Logout", {
      method: "POST"
      , headers: {
        "Content-Type": "application/json"
      }
    });
    if(res.ok){
      window.location.href = "/";
    } else {
      res = await res.json();
      throw new Error(res.message);
    }
  } catch (error) {
    
    UIkit.notification(error.message);
  }
}

const AuthReqPage = (props) => {

  return <div>
    <div className="uk-position-sticky uk-position-top uk-position-z-index uk-background-muted no-print" style={{ backgroundColor: "var(--header-bg-color)" }}>
      <div className="text-light  uk-flex" style={{ background: "url(/assets/img/BHLOGO3.png) center no-repeat", backgroundSize: "contain" }}>
        <div className="" >
          <a href="#offcanvas-usage" uk-toggle="target: #offcanvas-usage" className="primary-button uk-button uk-button-primary"><i className="text-light fa-solid fa-bars"></i></a>
          <span className="uk-margin-small-right"></span> <i className="fa-solid fa-clock"></i> <span id="time"></span>
        </div>
        <div className="uk-flex-1"></div>
        <div className="profileInfoContainer uk-flex uk-flex-right uk-flex-middle">

          <div className="uk-margin-small-right">
            <span className="uk-margin-small-right"></span><i className="fa-solid fa-user"></i> {props.user.name}
          </div>
          <div>
            <button type="button" className="primary-button uk-button uk-button-primary signout" onClick={logout}>Kijelentkezés <i className="fas fa-sign-out-alt"></i></button>
          </div>
        </div>
      </div>
    </div>

    <div id="offcanvas-usage" uk-offcanvas="true">
      <div className="uk-offcanvas-bar">

        <button className="uk-offcanvas-close" type="button" uk-close="true"></button>

        {/* <h3>Title</h3> */}

        <ul className="uk-nav uk-nav-default">
          <li className="uk-active"><a href="/"><i className="fas fa-2x fa-home"></i>Kezdőlap</a></li>

          <li className="uk-nav-divider"></li>
          
          <li><a href="/settings"><i className="fa-2x fa-solid fa-screwdriver-wrench"></i> Beállítások</a></li>
          <li><button type="button" className="uk-button uk-button-primary uk-width-1-1 signout" onClick={logout}>Kijelentkezés <i className="fa-2x fas fa-sign-out-alt"></i></button></li>

        </ul>

      </div>
    </div>


    <div className="container"><Head>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="" />
      <meta name="author" content="" />

      <title>{props?.title}</title>
      <link rel="icon" href={`/favicon.png`} />
      <link rel="stylesheet" href={`/css/reset.css`} />
      <link rel="stylesheet" href={`/lib/uikit-3.13.10/css/uikit.min.css`} />
      <link rel="stylesheet" href={`/css/animate.min.css`} />
      <link rel="stylesheet" href={`/lib/fontawesome-free-6.1.1-web/css/all.min.css`} />
      <link rel="stylesheet" href={`/css/bh.css`} />

    </Head>

      {props.children}

      <Footer></Footer>
      <Helmet>
        <script src={`/lib/uikit-3.13.10/js/uikit-icons.min.js`}></script>
        <script src={`/lib/uikit-3.13.10/js/uikit.min.js`}></script>
        <script src={`/lib/jquery-3.6.0/jquery-3.6.0.min.js`}></script>

      </Helmet>
    </div>

  </div>;
}

export default AuthReqPage;