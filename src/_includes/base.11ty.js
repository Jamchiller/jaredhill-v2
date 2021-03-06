const html = require("../html");

exports.render = (data) => {
  const {
    title,
    config,
    page,
    navigation,
    date,
    readingTime,
    blocks,
    content,
  } = data;
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}${title && " | "}${config.site.title}</title>
        <link rel="stylesheet" href="/css/styles.css" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="${googleFont(config.theme.fonts.body)}" rel="stylesheet" />
      </head>
      <body class="page">
        ${Header({ page, navigation, socials: config.site.socials })}
        ${Title({
          title,
          date,
          seconds: readingTime && getReadingTime(content),
        })}
        <main class="pad-gutter">
          <div class="w-content flow">
            ${blocks ? blocks.map(renderBlock(data)) : content}
          </div>
        </main>
        ${Footer({ footer: config.site.footer })}
      </body>
    </html>
  `;
};

function googleFont(name) {
  return `https://fonts.googleapis.com/css2?family=${name}:ital,wght@0,400;0,600;1,400;1,600&display=swap`;
}

function Header({ page, nav = [], socials = {} }) {
  return html`
    <header class="hstack wrap gap-xl pad-gutter fz-md bg-primary">
      <a href="/">
        <img src="/assets/icons/logo.svg" alt="Home" width="32" height="32" />
      </a>
      <nav class="grow hstack wrap jc-between">
        <ul role="list" class="hstack">
          ${nav.map(Link(page))}
        </ul>
        <ul role="list" class="hstack hide-on-mobile">
          ${Object.entries(socials).map(
            ([name, { url, icon }]) => html`
              <li>
                <a href=${url}>
                  <img src=${icon} alt="${name}" width="24" height="24" />
                </a>
              </li>
            `
          )}
        </ul>
      </nav>
    </header>
  `;
}

function Link(page) {
  return ({ url, label }) => {
    const current =
      page.url === url
        ? "page"
        : page.url.includes(url) && url !== "/"
        ? "true"
        : false;
    return html`
      <li>
        <a href=${url} ${current && `aria-current="${current}"`}>${label}</a>
      </li>
    `;
  };
}

function Title({ title, date, seconds }) {
  return html`
    <header class="mh-25 cover pad-xl tac bg-primary">
      <div class="w-content vstack ji-center">
        <h1>${title}</h1>
        ${date && seconds && PostMeta({ date, seconds })}
      </div>
    </header>
  `;
}

function readableDate(date) {
  return date.toLocaleDateString("en-GB", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function PostMeta({ date, seconds, className = "" }) {
  const niceDate = readableDate(date);
  const mins = Math.round(seconds / 60);
  return html`
    <div class="hstack gap-sm ${className}">
      <span>${niceDate}</span>
      <span>-</span>
      <time datetime="${seconds}s"> ${mins} minute${mins > 1 && "s"} </time>
    </div>
  `;
}

// very rough estimate in seconds
// don't use regexp to parse html!
function getReadingTime(content) {
  const contentWithoutHtml = content.replace(/(<([^>]+)>)/gi, "");
  const words = contentWithoutHtml.match(/[\u0400-\u04FF]+|\S+\s*/g);
  const wordCount = words ? words.length : 0;
  const wordsPerSecond = 200 / 60;
  const readingTime = wordCount / wordsPerSecond;
  return readingTime;
}

function Footer({ footer }) {
  return html`
    <footer>
      <div class="pad-xxl bg-primary leading-sm">
        <div class="w-content vstack">
          <h2>${footer.contact.title}</h2>
          <p>${footer.contact.body}</p>
        </div>
      </div>
      <div class="pad-xl tac invert fz-md">
        <div class="w-content">
          <p>${footer.credit}</p>
        </div>
      </div>
    </footer>
  `;
}

const components = {
  collection,
};

function renderBlock(data) {
  return (block) => {
    const component = components[block.type];
    if (!component) throw new Error(`Unrecognise block type: ${block.type}`);
    return component(data, block.props);
  };
}

function collection(data, { tag } = {}) {
  const pages = data.collections[tag];
  if (!pages) throw new Error(`Cannot find collection ${tag}`);
  return html`
    <ul role="list" class="hstack wrap">
      ${pages.map(
        ({ url, data }) => html`
          <li class="vstack gap-sm">
            <a href=${url} class="td-hover">${data.title}</a>
            ${PostMeta({
              date: data.date,
              seconds: getReadingTime(data.content),
              className: "color-text-light fz-md",
            })}
          </li>
        `
      )}
    </ul>
  `;
}
