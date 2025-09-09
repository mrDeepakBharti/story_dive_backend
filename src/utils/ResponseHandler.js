class ResponseHandler {
    static success(res, result, message = "Success", statusCode = 200) {
        return res.json({
            statusCode,
            success: true,
            message,
            result
        });
    }

  static failed(res,message="Something went wrong",statusCode=400,result={}) {
        return res.json({
            statusCode,
            success: false,
            message,
            result
        });
    }
  static error(res,message="Internal server error",statusCode=500,result={}) {
        return res.json({
            statusCode,
            success: false,
            message,
            result
        });
    }  
}
 
export default ResponseHandler;