import React, { forwardRef, useEffect, useState} from "react";
import ReactDOM from "react-dom";



const Modal = (props) => {
  var dom = undefined;
  const [children, setChildren] = useState(props.children);
  const [isOpen, setIsOpen] = useState(props.isOpen);
  var modalRoot = undefined;
  modalRoot = document.createElement('div');
  modalRoot.setAttribute('uk-modal', 'bg-close: false; stack: true');
  
  useEffect(() => {
    
    if (props.isOpen) {
        open();
      }
    return () => {
      if(document != undefined){

        document.body.removeChild(modalRoot);
      }
    }
  }, [])

  
  // modalRoot.id = 'modal-save';

  // useEffect(() => {
  //   if (props.isOpen) {
  //     open();
  //   }
  //   document.body.appendChild(modalRoot);
  //   return () => {
  //     document.body.removeChild(modalRoot);
  //   }
  // }, [])


  useEffect(() => {
    
    if(document != undefined){

      document.body.appendChild(modalRoot);
    }
    if (props.children) {
      ReactDOM.render(renderElement(props), modalRoot);
      open();
    }
  }, [props.children])

  return ReactDOM.render(renderElement(props), modalRoot);

  function open() {
    UIkit.modal(modalRoot).show();

  }

  function close() {

    UIkit.modal(modalRoot).hide();
    UIkit.modal(modalRoot).$destroy(true);
  }

  function renderElement(props) {


    return <div className="uk-modal-dialog uk-modal-body">
        
        <button className="uk-modal-close-default uk-icon uk-close" type="button" uk-close="" aria-label="Close"><svg width="14" height="14" viewBox="0 0 14 14"><line fill="none" stroke="#000" strokeWidth="1.1" x1="1" y1="1" x2="13" y2="13"></line><line fill="none" stroke="#000" strokeWidth="1.1" x1="13" y1="1" x2="1" y2="13"></line></svg></button>
          {props.children}
      </div>
    


  }

}
  ;

export default Modal;