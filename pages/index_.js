import Head from 'next/head'
import Page from '../components/Page'

export default function Home() {
  return (
    <Page>
      <main>
        <h1 className="title">
          asd <a href="https://nextjs.org">Next.js!</a>
        </h1>
        <ul className="uk-grid-small uk-child-width-1-2 uk-child-width-1-4@s" uk-sortable="handle: .uk-card" uk-grid="true">
    <li>
        <div className="uk-card uk-card-default uk-card-body uk-text-center">Item 1</div>
    </li>
    <li>
        <div className="uk-card uk-card-default uk-card-body uk-text-center">Item 2</div>
    </li>
    <li>
        <div className="uk-card uk-card-default uk-card-body uk-text-center">Item 3</div>
    </li>
    <li>
        <div className="uk-card uk-card-default uk-card-body uk-text-center">Item 4</div>
    </li>
    <li>
        <div className="uk-card uk-card-default uk-card-body uk-text-center">Item 5</div>
    </li>
    <li>
        <div className="uk-card uk-card-default uk-card-body uk-text-center">Item 6</div>
    </li>
    <li>
        <div className="uk-card uk-card-default uk-card-body uk-text-center">Item 7</div>
    </li>
    <li>
        <div className="uk-card uk-card-default uk-card-body uk-text-center">Item 8</div>
    </li>
</ul>
        <p className="description">
          Get started by editing <code>pages/index.js</code>
        </p>

        <div className="grid" uk-grid="true">
          <a href="https://nextjs.org/docs" className="uk-card uk-card-default uk-card-body uk-width-1-2@m">
            <h3>Documentation &rarr;</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className="uk-card uk-card-default uk-card-body uk-width-1-2@m">
            <h3>Learn &rarr;</h3>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className="uk-card uk-card-default uk-card-body uk-width-1-2@m"
          >
            <h3>Examples &rarr;</h3>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className="uuk-card uk-card-default uk-card-body uk-width-1-2@m"
          >
            <h3>Deploy &rarr;</h3>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>
    </Page>




  )
}
