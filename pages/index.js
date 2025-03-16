import React, { useState, useEffect, useContext } from 'react'
import AuthReqPage from '../components/AuthReqPage'

import io from "socket.io-client"



export async function getServerSideProps({ req, res }) {

    const control = req.control;
    try {

        const user = await control.CheckAccessCore(req, res);
        return {

            props: { user: user },
        }
    } catch (error) {
        res.setHeader("location", "/login");
        res.statusCode = 302;
        res.end();
    }
    return {
        props: { user: { isLoggedIn: false } },
    }


}

const Home = function ({ user }) {

    var title = "Dashboard";


    const [info, setInfo] = useState(undefined);
    const [time, setTime] = useState(new Date().toLocaleString());

    useEffect(() => {

        var socket = io.connect();

        socket.on('timeChange', function (data) { //Megjelenítjük az időt, ha állítani kell meg tudja tenni
            console.log(data);
            document.getElementById("time").innerHTML = new Date(data).toLocaleString();
        });

        socket.on('coinCount', function (data) { //get button status from client
            alert(`Kidobott érmék darabszáma: {data}`);
        });

        const fetchData = async () => {
            var res = await fetch("/api/getInfo", {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: "include",
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url

            });
            res = await res.json();
            console.log(res);
            await setInfo(res);

        }

        // call the function
        fetchData()
            // make sure to catch any error
            .catch(console.error);



    }, []);

    async function coinDropTest(e) {
        e.preventDefault();


        var res = await fetch("/api/tossACoinToYourWitcher", {
            method: "POST"
            , headers: { "Content-Type": "application/json" }
            , credentials: 'include'
        });

        if (res.ok) {
            res = await res.json();
        } else {
            res = await res.json();
            UIkit.notification(res.message, { status: "danger" });
        }


    }

    async function emptyHopper(e) {
        e.preventDefault();

        try{
            await UIkit.modal.confirm("Biztosan üríted?");
        }catch(error){
            return;
        }

        var res = await fetch("api/emptyHopper", {
            method: "POST"
            , headers : { 
                "Content-Type": "application/json"
            }
            , credentials: 'include'
        });

        if (res.ok) {
            res = await res.json();
            UIkit.notification("Ürítés elindítva");
        } else {
            res = await res.json();
            UIkit.notification(res.message, { status: "danger" });
        }
    }

    return (<AuthReqPage title={title} user={user}>
        <main>

            <h1 className="title uk-text-center ">
                <div>{title}</div>
            </h1>
            {user?.isLoggedIn && (
                <>

                    {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
                </>
            )}

            {info && (


                <div className="uk-flex">

                    <div className="uk-card uk-card-default uk-card-body uk-width-1-1@m" >

                        <div className="card-body">
                            <h5 className="card-title">Infó</h5>
                            <p className="card-text">Sorozatszám: <span className='uk-badge'>{info.settings.serialNumber}</span></p>
                            <p className="card-text">Érmék darabszáma: <span className='uk-badge'>{info.salesInfo.coinCount}</span></p>
                            <p className="card-text">Eladások: <span className='uk-badge'>{info.salesInfo.salesCount}</span></p>
                            <p className="card-text">Eladások utolsó feltöltés óta: <span className='uk-badge'>{info.salesInfo.salesAfterLastFillUp}</span></p>

                        </div>
                    </div>
                    <div className="uk-card uk-card-default uk-card-body uk-width-1-1@m" >

                        <div className="card-body">
                            <h5 className="card-title">Érme kidobás teszt</h5>
                            <p className="card-text">Az érme kidobás teszttel fizetés nélkül ellenőrizhető, hogy az érme kidobódik
                            </p>
                            <button id="coinDropTest" className="uk-button uk-button-primary" onClick={coinDropTest}>Érme kidobás teszt</button>
                        </div>
                    </div>
                    <div className="uk-card uk-card-default uk-card-body uk-width-1-1@m" >

                        <div className="card-body">
                            <h5 className="card-title">Ürítés</h5>
                            <p className="card-text">Ürítéssel a teljes tartalmat kidobja a gép, valamint megszámolja hány darab
                                volt benne.</p>
                            <button id="emptyHopper" className="uk-button uk-button-primary" onClick={emptyHopper}>Ürítés</button>
                        </div>
                    </div>
                    <div className="uk-card uk-card-default uk-card-body uk-width-1-1@m" >

                        <div className="card-body">
                            <h5 className="card-title">Feltöltés</h5>
                            <p className="card-text">Feltöltheted érmékkel az eszközt</p>
                            <div className="form-group row">
                                <div className="uk-flex uk-flex-middle">
                                    <input className="uk-input" type="number" value="1" min="1" max="1000" step="1" /><span>db</span>

                                </div>

                            </div>
                            <button id="fillUp" className="uk-button uk-button-success">Feltöltés</button>
                        </div>
                    </div>

                    <div className="uk-card uk-card-default uk-card-body uk-width-1-1@m" >

                        <div className="card-body">
                            <h5 className="card-title">Rendszerfrissítés</h5>
                            <p className="card-text">Frissítheted az eszköz rendszerét ha van új csomag</p>
                            <div className="form-group row">
                                <div className="col-auto">Verzió:</div>
                                <div className="col">{info.package.version}</div>

                            </div>
                            <button id="update" className="uk-button uk-button-secondary">Frissítés</button>
                        </div>
                    </div>
                    <div className="uk-card uk-card-default uk-card-body uk-width-1-1@m" >

                        <div className="card-body">
                            <h5 className="card-title">Újraindítás</h5>
                            <p className="card-text">Eszköz újraindítása</p>

                            <button id="restart" className="uk-button uk-button-danger">Újraindítás</button>
                        </div>
                    </div>

                </div>
            )}



        </main>
    </AuthReqPage>);


}



export default Home;