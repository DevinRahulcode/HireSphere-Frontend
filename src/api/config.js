// src/api/config.js
export const amplifyConfig = {
    API: {
        endpoints: [
            {
                name: "jobServiceApi",
                endpoint: "http://your-backend-url.aws-region.elb.amazonaws.com/api" 
            }
        ]
    }
};