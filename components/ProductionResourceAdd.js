import { useEffect, useState } from "react";
import Input from "./html/form/Input";
import Button from "./html/form/Button";


const ProductionResourceAdd = (props) => {

    var dom = undefined;
    function onDelete() {
        $(dom).remove();
        props.onDelete(props.intem);
    }

    const [items, setItems] = useState([]);

    var currentSelected = [];

    useEffect(async () => {

        var res = await fetch("/api/getAvailableResources", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
            , credentials: "include",
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({ params: {} }) // body data type must match "Content-Type" header
        });

        if (res.ok) {
            res = await res.json();



            setItems(res);
        }

    }, [])

    

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

            val = val && !isNaN(val) ? +val              // number
                : val === 'undefined' ? undefined         // undefined
                    : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
                        : val;                                                // string

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

    function serializeForm(e){
        e.preventDefault(); 
        
        var item = deepSerializeForm(e.target); 

        if(item.id == 0){
            UIkit.notification("Válassz egy eszközt!", {status: "danger"});
            return;
        }
        var selectedItem = items.find((o) => {
            return o.id == item.id;
        });

        item.name = selectedItem.name
        item.code = selectedItem.code

        currentSelected.push(selectedItem);

        var filteredItems = items.filter((o) => {
            return currentSelected.findIndex((e) => {
                return e.id == o.id;
            }) == -1;
        });

        setItems([...filteredItems]);

        // console.log(item, e.target);
        props.onSubmit(item);
        
    }


    return <>

        <div>
            <form onSubmit={serializeForm} >
                <div>

                    <div><label className="uk-form-label" htmlFor="productionResourceAddResourceId">Mérőeszközök</label></div>
                    {
                        items.length == 0 && (<><div className="uk-flex uk-flex-middle"><i class="fa-solid fa-triangle-exclamation fa-2x uk-text-danger uk-padding-small"></i>Nincs szabad eszköz</div></>)
                    }
                    {
                        items.length > 0 && (<>
                        
                    <select className="uk-select" name="id" id="productionResourceAddResourceId">
                        <option value="0">Válassz</option>
                        {items && (
                            items.map((item) => {
                                return <option value={item.id}>{item.code} {item.name}</option>
                            })
                        )}
                    </select>
                        </>)
                    }
                </div>
                <p className="uk-text-right">
                    {/* <Button className="outline-button uk-modal-close">Mégsem</Button> */}
                    <Button type="submit">Hozzáadás</Button>
                </p>
            </form>
        </div>

    </>;

};

export default ProductionResourceAdd;