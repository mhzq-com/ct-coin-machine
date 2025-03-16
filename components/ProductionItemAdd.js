import { useEffect, useState } from "react";
import Input from "./html/form/Input";
import Button from "./html/form/Button";


const ProductionItemAdd = (props) => {

    var dom = undefined;
   

    const [items, setItems] = useState([]);

    useEffect(async () => {

        var res = await fetch("/api/DI/Item", {
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
            UIkit.notification("Válassz egy anyagtípust!", {status: "danger"});
            return;
        }
        var selectedItem = items.find((o) => {
            return o.id == item.id;
        });



        item.hakCode = selectedItem.hakCode
        item.name = selectedItem.name
        item.code = selectedItem.code

        // console.log(item, e.target);
        props.onSubmit(item);
        
    }


    return <>

        <div>
            <form onSubmit={serializeForm} >
                <div>

                    <div><label className="uk-form-label" htmlFor="productionItemAddItemId">Anyagtípus</label></div>
                    <select className="uk-select" name="id" id="productionItemAddItemId">
                        <option value="0">Válassz</option>
                        {items && (
                            items.map((item) => {
                                return <option value={item.id}>{item.name} {item.hakCode}</option>
                            })
                        )}
                    </select>
                </div>
                <div className="uk-margin">
                    <div><label className="uk-form-label" htmlFor="productionItemAddQuantity">Mennyiség</label></div>
                    <Input  className="number" id="productionItemAddQuantity" name="quantity" value={0}></Input>
                </div>
                <div className="uk-margin">
                    <div><label className="uk-form-label" htmlFor="productionItemAddQuantityUnit">Mennyiségi egység</label></div>
                    <Input id="productionItemAddQuantityUnit" name="quantityUnit" value={"kg"}></Input>
                </div>
                <p className="uk-text-right">
                    {/* <Button className="outline-button uk-modal-close">Mégsem</Button> */}
                    <Button type="submit">Hozzáadás</Button>
                </p>
            </form>
        </div>

    </>;

};

export default ProductionItemAdd;