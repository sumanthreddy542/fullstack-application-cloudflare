class RandomNumberGenerator{
  constructor(){
      this.randomNumbers = [0, 1];
  }

  GenerateRandomNumber(){
      let randomNum = Math.floor(Math.random() * (this.randomNumbers.length));
      return this.randomNumbers[randomNum];
  }
}

const randonNumInstance = new RandomNumberGenerator();
Object.freeze(randonNumInstance);


class ElementHandler{
  element(element) {
    if(element.tagName === "title")
      this.changeTitle(element);
    else if(element.tagName === "h1")
      this.changeMainTitle(element);
    else if(element.tagName == "p")
      this.changeDescription(element);
    else if(element.tagName == "a")
      this.changeAnchorTag(element);
  }

  text(text) {
  }

  changeTitle(titleElement){}

  changeMainTitle(mainTitleElement){}

  changeDescription(descriptionElement){}

  changeAnchorTag(anchorTagElement){}
}

class LinkedInRewriterHandler extends ElementHandler{
  changeTitle(titleElement){
    titleElement.setInnerContent("LinkedIn Page");
  }

  changeMainTitle(mainTitleElement){
    mainTitleElement.setInnerContent("Linkedin Profile");
  }

  changeDescription(descriptionElement){
    descriptionElement.setInnerContent("Click below link to go to my LinkedIn profile!");
  }

  changeAnchorTag(anchorTagElement){
    anchorTagElement.setAttribute("href", "https://www.linkedin.com/in/sumanthkaliki/");
    anchorTagElement.setInnerContent("LinkedIn");
  }
}

class CloudFlareRewriteHandler extends ElementHandler{
  changeTitle(titleElement){
    titleElement.setInnerContent("CloudFlare Page");
  }

  changeMainTitle(mainTitleElement){
    mainTitleElement.setInnerContent("Github project repository");
  }

  changeDescription(descriptionElement){
    descriptionElement.setInnerContent("Click below link to go to my github project repository!");
  }

  changeAnchorTag(anchorTagElement){
    anchorTagElement.setAttribute("href", "https://github.com/sumanthreddy542/fullstack-application-cloudflare");
    anchorTagElement.setInnerContent("Github");
  }
}

const rewriteHtmlResponse = function(randomNum){
  if(randomNum === 1)
    return new HTMLRewriter()
               .on('title', new LinkedInRewriterHandler())
               .on('h1#title', new LinkedInRewriterHandler())
               .on('p#description', new LinkedInRewriterHandler())
               .on('a#url', new LinkedInRewriterHandler());
  else
    return new HTMLRewriter()
               .on('*', new CloudFlareRewriteHandler());
}

const fetchRandomUrl = async function(variants){
  const randomNum = randonNumInstance.GenerateRandomNumber();
  let urlResponse = await fetch(variants[randomNum]);
  
  return urlResponse;
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const url = "https://cfw-takehome.developers.workers.dev/api/variants";

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {

  let response = await fetch(url);
  let jsonObj;

  if(response.ok)
    jsonObj = await response.json();
  else
    console.log("reponse error from url");

  const randomNum = randonNumInstance.GenerateRandomNumber();
  let urlResponse = await fetch(jsonObj.variants[randomNum]);

  let transformResponse = rewriteHtmlResponse(randomNum).transform(urlResponse);
 
  return transformResponse;
}