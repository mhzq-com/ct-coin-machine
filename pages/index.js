import React, { useState, useEffect, useContext } from 'react'
import AuthReqPage from '../components/AuthReqPage'

import io from "socket.io-client"
import Input from '../components/html/form/Input';



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


    const now = new Date();

    // előző hónap első napja
    const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // előző hónap utolsó napja
    const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);


    const [info, setInfo] = useState(undefined);
    const [time, setTime] = useState(new Date().toLocaleString());
    const [fillUpCount, setFillUpCount] = useState(1);
    const [dateFrom, setDateFrom] = useState((firstDayPrevMonth).toLocaleDateString().replaceAll('.', '').replaceAll(' ', '-'));
    const [dateTo, setDateTo] = useState((lastDayPrevMonth).toLocaleDateString().replaceAll('.', '').replaceAll(' ', '-'));

    const [updateProgress, setUpdateProgress] = useState({});
    const updateProgressTypes = new Map([
        ["stderr", "uk-text-danger"]
        , ["error", "uk-text-danger"]
        , ["stdout", ""]
    ]);


    useEffect(() => {

        var socket = io.connect();

        socket.on("updateProgress", (info) => {
            console.log(info);
            setUpdateProgress(info);
        });

        socket.on('timeChange', function (data) { //Megjelenítjük az időt, ha állítani kell meg tudja tenni
            // console.log(data);
            document.getElementById("time").innerHTML = new Date(data).toLocaleString();
            // setTime(new Date(data).toLocaleDateString());
        });

        socket.on('coinCount', function (data) {
            alert(`Kidobott érmék darabszáma: ${data}`);
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

        try {
            await UIkit.modal.confirm("Biztosan üríted?");
        } catch (error) {
            return;
        }

        var res = await fetch("api/emptyHopper", {
            method: "POST"
            , headers: {
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

    async function fillUp(e) {
        e.preventDefault();

        var coinCount = parseInt(fillUpCount)

        if (isNaN(coinCount)) {
            alert(fillUpCount.toString() + " nem egy szám");
            return;
        }

        try {
            await UIkit.modal.confirm(`Biztosan feltölti ` + coinCount + ` darabszámmal?`);
        } catch (error) {
            return;
        }



        var res = await fetch("/api/fillUpHopper",
            {
                method: "POST"
                , headers: { "Content-Type": "application/json" }
                , credentials: "include"
                , body: JSON.stringify({ coinCount: coinCount })
            });
        if (res.ok) {
            var data = await res.json();

            UIkit.notification(`Feltöltés utáni darabszám: ${data}`, { status: "success" });
        } else {
            res = await res.json();
            UIkit.notification(`Feltöltés hiba: ${res.message}`, { status: "danger" });
        }

    }

    async function update(e) {
        e.preventDefault();

        try {
            await UIkit.modal.confirm(`Biztosan frissíti a rendszert?`);
        } catch (error) {
            return;
        }



        var res = await fetch("/api/update",
            {
                method: "POST"
                , headers: { "Content-Type": "application/json" }
                , credentials: "include"
            });
        if (res.ok) {

            UIkit.notification(`Rendszerfrissítés sikeres! Újraindítás szükséges!`, { status: "success" });
        } else {
            res = await res.json();
            UIkit.notification(`Rendszerfrissítés hiba: ${res.message}`, { status: "danger" });
        }

    }

    async function restart(e) {
        e.preventDefault();

        try {
            await UIkit.modal.confirm(`Biztosan újraindítja a rendszert?`);
        } catch (error) {
            return;
        }



        var res = await fetch("/api/restart",
            {
                method: "POST"
                , headers: { "Content-Type": "application/json" }
                , credentials: "include"
            });
        if (res.ok) {

            UIkit.notification(`Újraindítás 5mp múlva!`, { status: "success" });
        } else {
            res = await res.json();
            UIkit.notification(`Újraindítás hiba: ${res.message}`, { status: "danger" });
        }

    }

    async function getStat(e) {
        e.preventDefault();
        var data = {
            dateFrom: dateFrom
            , dateTo: dateTo
        }

        var res = await fetch("/api/getStat",
            {
                method: "POST"
                , headers: { "Content-Type": "application/json" }
                , credentials: "include"
                , body: JSON.stringify(data)
            });
        if (res.ok) {

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "export.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } else {
            res = await res.json();
            UIkit.notification(`Újraindítás hiba: ${res.message}`, { status: "danger" });
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



            <div className="uk-flex">
                {info && (

                    <div className="uk-card uk-card-default uk-card-body uk-width-1-1@m" >

                        <div className="card-body">
                            <h5 className="card-title">Infó</h5>
                            <p className="card-text">Sorozatszám: <span className='uk-badge'>{info.settings.serialNumber}</span></p>
                            <p className="card-text">Érmék darabszáma: <span className='uk-badge'>{info.salesInfo.coinCount}</span></p>
                            <p className="card-text">Eladások: <span className='uk-badge'>{info.salesInfo.salesCount}</span></p>
                            <p className="card-text">Eladások utolsó feltöltés óta: <span className='uk-badge'>{info.salesInfo.salesCountAfterLastFillUp}</span></p>

                        </div>
                    </div>

                )}
                <div className="uk-card uk-card-default uk-card-body uk-width-1-1@m" >

                    <div className="card-body">
                        <form onSubmit={getStat}>
                            <h5 className="card-title">Lekérdezés</h5>
                            <p>Lekérdezhetjük két dátum közötti összes értékesítést és egy összesítést</p>
                            <div>
                                <label for="dateFrom" className="card-text">Dátum -tól: </label>
                                <Input id="dateFrom" className={'uk-input'} name="dateFrom" type="date" onChange={(e) => setDateFrom(e.target.value)} value={dateFrom} />
                            </div>
                            <div>
                                <label for="dateFrom" className="card-text">Dátum -ig: </label>
                                <Input id="dateFrom" className={'uk-input'} name="dateFrom" type="date" onChange={(e) => setDateTo(e.target.value)} value={dateTo} />
                            </div>
                            <button className="uk-button uk-button-primary" type="submit">Lekérdezés</button>
                        </form>
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
                                {/* <input className="uk-input" type="number" value="1" min="1" max="1000" step="1" /><span>db</span> */}
                                <Input className="uk-input" type="number" value={fillUpCount} onChange={(e) => { setFillUpCount(e.target.value) }} />
                            </div>

                        </div>
                        <button id="fillUp" className="uk-button uk-button-success" onClick={fillUp}>Feltöltés</button>
                    </div>
                </div>

                <div className="uk-card uk-card-default uk-card-body uk-width-1-1@m" >

                    <div className="card-body">
                        <h5 className="card-title">Rendszerfrissítés</h5>
                        <p className="card-text">Frissítheted az eszköz rendszerét ha van új csomag</p>
                        <div className="form-group row">
                            <div className="col-auto">Verzió:</div>
                            {info && (
                                <div className="col">{info.package.version}</div>
                            )}
                        </div>
                        <button id="update" className="uk-button uk-button-secondary" onClick={update}>Frissítés</button>

                        {updateProgress && (
                            <>
                            <div>Rendszer konzol output</div>
                            <div className='uk-background-secondary uk-margin'>
                                <div style={{ color: "white" }} className={updateProgressTypes.get(updateProgress.type)}>{updateProgress.data}</div>

                            </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="uk-card uk-card-default uk-card-body uk-width-1-1@m" >

                    <div className="card-body">
                        <h5 className="card-title">Újraindítás</h5>
                        <p className="card-text">Eszköz újraindítása</p>

                        <button id="restart" className="uk-button uk-button-danger" onClick={restart}>Újraindítás</button>
                    </div>
                </div>

            </div>



        </main>
    </AuthReqPage>);


}



export default Home;