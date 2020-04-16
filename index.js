/**
 * File : index.js
 * Author : Sumanth Kaliki <sumanth.reddy542@gmail.com>
 * Date : 15-04-2020
 */


/**
 * Singleton class to generate randomnumbers.
 */
class RandomNumberGenerator{
  constructor(){
      this.randomNumbers = [0, 1];
  }

  // Function to generate a random number.
  GenerateRandomNumber(){
      let randomNum = Math.floor(Math.random() * (this.randomNumbers.length));
      return this.randomNumbers[randomNum];
  }
}

const randonNumInstance = new RandomNumberGenerator();
Object.freeze(randonNumInstance);


/**
 * Base class for handling HTMLRewriter.
 * Extend this class to modify elements.
 */
class ElementHandler{
  // Called from HTMLRewriter.
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

  // Method to change the contents of title element.
  changeTitle(titleElement){}

  // Method to change the contents of h1 element.
  changeMainTitle(mainTitleElement){}

  // Method to change the contents of p element.
  changeDescription(descriptionElement){}

  // Method to change the contents of a element.
  changeAnchorTag(anchorTagElement){}
}

/**
 * Class to replace existing contents with linkedin related contents.
 * Derived from ElementHandler.
 */
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

  // The anchor tag now points to my LinkedIn page.
  changeAnchorTag(anchorTagElement){
    anchorTagElement.setAttribute("href", "https://www.linkedin.com/in/sumanthkaliki/");
    anchorTagElement.setInnerContent("LinkedIn");
  }
}

/**
 * Class to replace existing contents with github related contents.
 * Derived from ElementHandler.
 */
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
  // The anchor tag now points to this github project repository page.
  changeAnchorTag(anchorTagElement){
    anchorTagElement.setAttribute("href", "https://github.com/sumanthreddy542/fullstack-application-cloudflare");
    anchorTagElement.setInnerContent("Github");
  }
}

/**
 * return new Html content after rewriting.
 * @param {randomNum} randomNumbergenerated 
 */
const rewriteHtmlResponse = function(randomNum){
  /**
   *  on function of HTMLRewriter is called by specifying a particulat element.
   *  for ex: h1#title -> for h1 tag with id as title.
   */
  if(randomNum === 1)
    return new HTMLRewriter()
               .on('title', new LinkedInRewriterHandler())
               .on('h1#title', new LinkedInRewriterHandler())
               .on('p#description', new LinkedInRewriterHandler())
               .on('a#url', new LinkedInRewriterHandler());
  /**
   *  on function of HTMLRewriter is called for all the elements ("*").
   *  The handler class is responsible for checking a particular element.
   */
  else
    return new HTMLRewriter()
               .on('*', new CloudFlareRewriteHandler());
}


addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})


// Url to fetch variants.
const url = "https://cfw-takehome.developers.workers.dev/api/variants";
// Cookie name.
const cookieName = "variant";

/**
 * Respond with modified response.
 * @param {Request} request
 */
async function handleRequest(request) {
  let jsonObj;
  let randomNum;

  // Get the cookies from the request.
  let cookie = request.headers.get("Cookie");

  let response = await fetch(url);
  // Check the status of response and then convert to json.
  if(response.ok)
    jsonObj = await response.json();
  else
    console.log("reponse error from url");

  // If there are no cookies, generate a random number.
  if(cookie === null){
    // Generate a random number and fetch from one of the variants returned.
    randomNum = randonNumInstance.GenerateRandomNumber();
  }
  // else, get the number from the cookie. The cookie is saved as variant number.
  else{
    let stringMatch = cookie.match("variant=[^;]");
    try{
      randomNum = parseInt(stringMatch[0].charAt(stringMatch[0].length-1));
      if(randomNum === 0 || randomNum === 1 ){  
      }
      else
        randomNum = randonNumInstance.GenerateRandomNumber();
    }
    catch{
      randomNum = randonNumInstance.GenerateRandomNumber();
    }
  }

  let urlResponse = await fetch(jsonObj.variants[randomNum]);

  // Rewrite the response by calling transform.
  let transformResponse = rewriteHtmlResponse(randomNum).transform(urlResponse);
  // Set the cookie.
  transformResponse.headers.set('Set-Cookie', "variant="+randomNum);
 
  return transformResponse;
}