import Page from '../components/Page'
import Input from '../components/html/form/Input';
import Grid from '../components/html/Grid'
import Section from '../components/html/Section'


async function submitLogin(e) {
  e.preventDefault();

  var wut = await fetch("/api/Authentication/login", {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    credentials: "include",
    redirect: 'follow', // manual, *follow, error
    body: JSON.stringify({ user: $("input[name=user]").val(), password: $("input[name=password]").val() }) // body data type must match "Content-Type" header
  });
  
  if(wut.ok){
    
    window.location.href="/";
  } else {
    wut = await wut.json();
    UIkit.notification({message: wut.message, status: "danger"});
  }
  
}

export default function Home() {

 

  return (
    <Page title="Bejelentkezés">
      <Section className="uk-height-viewport uk-background-cover" style={{ backgroundImage: "url(/assets/img/camping-1845906_1280.jpg)" }}>

        <Grid className="uk-flex-right uk-height-viewport">
          <Grid className="uk-position-relative uk-width-1-3@s">

            <form className="uk-position-center" onSubmit={submitLogin}>
              <div className='uk-background-default uk-padding uk-border-rounded'>
                <fieldset>
                  <legend className="uk-legend uk-text-center">

                    Bejelentkezés
                  </legend>
                  <div className="uk-margin">
                    <Input className="uk-input" type="text" name="user" placeholder="felhasználónév" ></Input>
                  </div>
                  <div className="uk-margin">
                    <Input className="uk-input" type="password" name="password" placeholder="jelszó"></Input>
                  </div>
                  <button className="uk-button uk-align-center" type="submit">Bejelentkezés</button>
                </fieldset>
              </div>
            </form>
          </Grid>
        </Grid>
      </Section>

    </Page>

  )
}
