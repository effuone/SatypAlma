import axios from "axios";

class Parser
{
    static async getHtml(url)
    {
        try{
            const response = await axios.get(url)
            return response   
        }catch(e){
            console.log(e)
        }
    }
    static async getScrappedHtml(key, url)
    {
        try{
            const response = await axios.get(`http://api.scraperapi.com?api_key=${key}&url=${url}`)
            return response
        }catch(e){
            console.log(e)
        }
    }
}
export default Parser