import React, { useState, useEffect, useRef } from 'react';

import { createPortal } from 'react-dom';


// import 'uikit/dist/css/uikit.min.css';
// import 'uikit/dist/js/uikit.min.js';
// import 'uikit/dist/js/uikit-icons.min.js'; // If you need icons





export default function Modal2(props) {


    var isOpen = props.children != undefined;
    // Use state to manage the visibility of the modal
    const [visible, setVisible] = useState(isOpen);
    const modalRef = useRef(null);
    var [modal, setModal] = useState(undefined);
    const [content, setContent] = useState(props.children);

    // Listen for changes in the `isOpen` prop
    // and update the state accordingly
    if (isOpen !== visible) {
        setVisible(isOpen);
    }

    useEffect(() => {
        var m = UIkit.modal(modalRef.current, {stack: true, bgClose: false});
        setModal(m);
        console.log(m);
        m.$el.addEventListener('hide', (event) => {
            setContent(<></>)
        });


    }, []);

    useEffect(() => {
        console.log(props.children);
        if (props.children) {

            setContent(props.children);
            setVisible(true);


             modal.show();
        }
    }, [props.children])

    // Function to handle closing the modal
    const handleClose = () => {
        setVisible(false);
        setContent(<></>);
        if (props.onClose) {

            props.onClose();
        }
    };



    // Render the modal
    return (
        createPortal(
        <div uk-modal={visible.toString()} ref={modalRef} bg-close={ false}>
            <div className="uk-modal-dialog uk-modal-body">
                <button className="uk-modal-close-default uk-icon uk-close" type="button" uk-close="" onClick={handleClose} aria-label="Close"><svg width="14" height="14" viewBox="0 0 14 14"><line fill="none" stroke="#000" strokeWidth="1.1" x1="1" y1="1" x2="13" y2="13"></line><line fill="none" stroke="#000" strokeWidth="1.1" x1="13" y1="1" x2="1" y2="13"></line></svg></button>

                {content}
            </div>
        </div>
        , document.body)
    );
};

