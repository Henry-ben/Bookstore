import pool from "../config/db.js";


// GET BUSINESS SETTINGS
export async function getSettings(req, res) {
    try {
        const result = await pool.query(`SELECT 
            id,
            businessName,
            businessEmail,
            businessPhone,
            businessAddress,
            receiptFooter
            FROM settings
          WHERE id = 1`
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Business settings not found"
            });
        }

        const settings = result.rows[0];

        res.json({
            businessName: settings.business_name,
            businessEmail: settings.business_email,
            businessPhone: settings.business_phone,
            businessAddress: settings.business_address,
            receiptFooter: settings.receipt_footer
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to get settings"
        });
    }
};


// UPDATE BUSINESS SETTINGS
export async function updateSettings(req, res) {
    try {
        const {
            businessName,
            businessEmail,
            businessPhone,
            businessAddress,
            receiptFooter
        } = req.body;

        const result = await pool.query(
            `UPDATE settings SET
                business_name = $1,
                business_email = $2,
                business_phone = $3,
                business_address = $4,
                receipt_footer = $5
            WHERE id = 1
            RETURNING 
             business_name,
             business_email,
             business_phone,
             business_address,
             receipt_footer`,
            [
                businessName,
                businessEmail,
                businessPhone, 
                businessAddress, 
                receiptFooter
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Business settings not found"
            });
        }

        const updatedSettings = result.rows[0];

        res.json({
            message: "Settings updated successfully",
            settings: {
                businessName: updatedSettings.business_name,
                businessEmail: updatedSettings.business_email,
                businessPhone: updatedSettings.business_phone,
                businessAddress: updatedSettings.business_address,
                receiptFooter: updatedSettings.receipt_footer
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update settings"
        });
    }
}

