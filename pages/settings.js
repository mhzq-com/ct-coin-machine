import React, { useState, useEffect } from 'react'
import AuthReqPage from '../components/AuthReqPage'
import Input from '../components/html/form/Input';
import Select from '../components/html/form/Select';
import Button from '../components/html/form/Button';
// import $ from 'jquery';

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

const Home = ({ user }) => {

    var title = "Beállítások";

    const [types, setTypes] = useState(undefined);
    const [settings, setSettings] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [companyIdVisible, setCompanyIdVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    const fetchData = async () => {

        var res = await fetch("/api/getSettingTypes", {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: "include",
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({ params: {}, orderby: { name: "ASC" } }) // body data type must match "Content-Type" header
        });
        res = await res.json();


        setTypes(res);

        var items = await fetch("/api/DI/Setting", {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: "include",
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({ params: {}, orderby: { name: "ASC" } }) // body data type must match "Content-Type" header
        });
        items = await items.json();

        setSettings(items);

        loadCompanies();
    }
    useEffect(() => {
        // call the function
        fetchData()
            // make sure to catch any error
            .catch(console.error);
    }, []);

    function deepSerializeForm(form) {

        var obj = {};

        var formData = new FormData(form);

        var coerce_types = { 'true': !0, 'false': !1, 'null': null };

        /**
         * Get the input value from the formData by key
         * @return {mixed}
         */
        var getValue = function (formData, key) {

            var val = formData.get(key);
            console.log(val, val.length);
            val = (val.length == 0) ? undefined
                : $(form).find(`input[name=${key}]`).attr('type') == 'password' ? val
                : !isNaN(val) ? +val              // number
                : val === 'undefined' ? undefined         // undefined
                    : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
                        : val;                                                // string

            //console.log(val);
            return val;
        }

        for (var key of formData.keys()) {

            var val = getValue(formData, key);
            var cur = obj;
            var i = 0;
            var keys = key.split('][');
            var keys_last = keys.length - 1;


            if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {

                keys[keys_last] = keys[keys_last].replace(/\]$/, '');

                keys = keys.shift().split('[').concat(keys);

                keys_last = keys.length - 1;

            } else {

                keys_last = 0;
            }


            if (keys_last) {

                for (; i <= keys_last; i++) {
                    key = keys[i] === '' ? cur.length : keys[i];
                    cur = cur[key] = i < keys_last
                        ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : [])
                        : val;
                }

            } else {

                if (Array.isArray(obj[key])) {

                    obj[key].push(val);

                } else if (obj[key] !== undefined) {

                    obj[key] = [obj[key], val];

                } else {

                    obj[key] = val;

                }

            }

        }

        return obj;

    }

    async function onSettingsFormSubmit(e) {
        e.preventDefault();

        var data = deepSerializeForm($("form[name=settingsForm]")[0]);

        
        if(data.pin == undefined || data.pin.length == 0){
            delete data.pin;
        }
        console.log(data);

        var req = await fetch("/api/Control/SaveSettings", {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: "include",
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });

        if (req.ok) {
            var res = await req.json();
            UIkit.notification({ message: `Sikeres mentés`, status: "success" })
        } else {
            var res = await req.json();
            UIkit.notification({ message: res.message, status: "danger" });
        }

    }

    async function loadCompanies() {
        try {
            setIsLoading(true);
            var res = await fetch("/api/Control/GetCompanyList", {
                method: "POST"
                , headers: {
                    "Content-Type": "application/json"
                    , "Authorization": "Bearer f1b30315391805fc222d8dc5ba0f1f54faf4_500"
                }
            })
            if (res.ok) {
                setCompanies(await res.json());
            } else {
                res = await res.json();
                throw new Error(res.error_description);
            }
        } catch (error) {
            UIkit.notification(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    function setCompany(companyId) {
        let set = settings.find((o) => { return o.name == "companyId" });
        set.value = companyId;
        console.log(settings);
        setSettings([...settings]);
        // setSettings(prev => prev.map((item, i) => i === 1 ? {name: "companyId", value: companyId, description: "asd"} : item));
    }

    return (<AuthReqPage title={title} user={user}>
        <main>

            <h1 className="title uk-text-center uk-text-primary">
                <div>{title}</div>
            </h1>
            {user?.isLoggedIn && (
                <>

                    {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
                </>
            )}

            <form name="settingsForm" className='' method='POST' onSubmit={onSettingsFormSubmit}>
                <div className='uk-container'>
                    <div id="settings">
                        {settings.length > 0 && (
                            settings.map((setting) => {
                                switch (setting.name) {
                                    case "coinCount":
                                        return (
                                            <div key={setting.name} className='input-group uk-margin'>
                                                <div className='uk-margin'>

                                                    <label htmlFor={setting.name}>{setting.description}</label>
                                                </div>
                                                <Input className="number" type="number" id={setting.name} name={setting.name} value={setting.value} required={true} />

                                            </div>
                                        )
                                        break;
                                    case "hopper":
                                        return (
                                            <div key={setting.name} className='input-group uk-margin'>
                                                <div className='uk-margin'>

                                                    <label htmlFor={setting.name}>{setting.description}</label>
                                                </div>
                                                <Select className='uk-select' id={setting.name} name={setting.name} value={setting.value} required={true} >
                                                    {types && types.hopperTypes.length > 0 && types.hopperTypes.map((o) => {
                                                        return <option>{o}</option>
                                                    })
                                                    }
                                                </Select>

                                            </div>
                                        )
                                        break;
                                    case "pos":
                                        return (
                                            <div key={setting.name} className='input-group uk-margin'>
                                                <div className='uk-margin'>

                                                    <label htmlFor={setting.name}>{setting.description}</label>
                                                </div>
                                                <Select className='uk-select' id={setting.name} name={setting.name} value={setting.value} required={true} onChange={function (o) { console.log(o, this); o.target.value = o.target.value; }} >
                                                    {types && types.posTypes.length > 0 && types.posTypes.map((o) => {
                                                        return <option>{o}</option>
                                                    })
                                                    }
                                                </Select>

                                            </div>
                                        )
                                        break;
                                    case "companyId":

                                        return (
                                            <div key={setting.name} className='input-group uk-margin'>
                                                <div className='uk-margin'>

                                                    <label htmlFor={setting.name}>{setting.description}</label>
                                                </div>
                                                <div className={`${isLoading ? 'loading' : ''}`}><Select className='uk-select' id={`${setting.name}_select`} value={setting.value} onChange={function (o) { console.log(o, this); o.target.value = o.target.value; setCompany(o.target.value); }} >
                                                    {companies && companies.length > 0 && companies.map((o) => {
                                                        return <option value={o.id}>{o.name}</option>
                                                    })
                                                    }
                                                </Select>
                                                </div>
                                                <Button onClick={() => { setCompanyIdVisible(!companyIdVisible) }}>Manuális bevitel</Button>
                                                <Input className={`${companyIdVisible ? '' : 'uk-hidden'} number`} type="number" id={setting.name} name={setting.name} value={setting.value} required={true} />


                                            </div>
                                        )
                                        break;
                                    case "pin":
                                        return (
                                            <div key={setting.name} className='input-group uk-margin'>
                                                <div className='uk-margin'>

                                                    <label htmlFor={setting.name}>{setting.description}</label>
                                                </div>
                                                <Input id={setting.name} name={setting.name} value={''} type="password" />

                                            </div>
                                        )
                                        break;
                                    default:
                                        return (
                                            <div key={setting.name} className='input-group uk-margin'>
                                                <div className='uk-margin'>

                                                    <label htmlFor={setting.name}>{setting.description}</label>
                                                </div>
                                                <Input id={setting.name} name={setting.name} value={setting.value} type="text" required={true} />

                                            </div>
                                        )
                                        break;
                                }
                            })
                        )}

                    </div>
                </div>

                <div className='uk-margin uk-grid'>
                    <div className='uk-width-1-2  uk-align-center'>

                        <button type="submit" className='uk-border-rounded uk-button uk-button-primary uk-width-1'>Mentés</button>
                        <i className="fa-solid fa-cloud-exclamation"></i>
                    </div>

                </div>
            </form>

        </main>
    </AuthReqPage>);





}



export default Home;