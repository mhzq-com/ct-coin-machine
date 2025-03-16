import Head from "next/head";
import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import Footer from "./html/Footer";

const Page = (props) => {
  
  useEffect(() => {

  }, []);
    return <div><div className="container"><Head>
      <title>{props.title}</title>
      <link rel="icon" href="/favicon.png" />
      <link rel="stylesheet" href="/css/reset.css" />
      <link rel="stylesheet" href="/lib/uikit-3.13.10/css/uikit.min.css" />
      <link rel="stylesheet" href="/css/animate.min.css" />
      <script src="/lib/jquery-3.6.0/jquery-3.6.0.min.js"></script>
    </Head>
      {props.children}

      <Footer></Footer>
      <Helmet>
        <script src="/lib/uikit-3.13.10/js/uikit-icons.min.js"></script>
        <script src="/lib/uikit-3.13.10/js/uikit.min.js"></script>

      </Helmet>
    </div>
    </div>;
  
}

export default Page;