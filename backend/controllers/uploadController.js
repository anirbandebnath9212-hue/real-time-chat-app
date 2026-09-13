const cloudinary = require("../config/cloudinary");


// =========================
// UPLOAD FILE
// =========================

const uploadFile = async (req, res) => {

    try {

        // Check if file exists

        if (!req.file) {

            return res.status(400).json({

                message:
                    "Please select a file"

            });

        }


        // Upload file to Cloudinary

        const result =
            await new Promise(
                (resolve, reject) => {

                    const uploadStream =
                        cloudinary.uploader.upload_stream(

                            {
                                resource_type:
                                    "auto"
                            },

                            (error, result) => {

                                if (error) {

                                    reject(error);

                                } else {

                                    resolve(result);

                                }

                            }

                        );


                    uploadStream.end(
                        req.file.buffer
                    );

                }
            );


        // Determine file type

        let type = "file";


        if (
            req.file.mimetype.startsWith(
                "image/"
            )
        ) {

            type = "image";

        } else if (
            req.file.mimetype.startsWith(
                "video/"
            )
        ) {

            type = "video";

        }


        // Send response

        res.status(200).json({

            message:
                "File uploaded successfully",

            type,

            fileUrl:
                result.secure_url,

            fileName:
                req.file.originalname,

            fileSize:
                req.file.size

        });


    } catch (error) {

        console.error(
            "Upload error:",
            error
        );


        res.status(500).json({

            message:
                "File upload failed",

            error:
                error.message

        });

    }

};


module.exports = {
    uploadFile
};