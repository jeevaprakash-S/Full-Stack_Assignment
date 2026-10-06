const express = require("express");
const mongoose = require("mongoose");
const Contact = require("../model/Contact");

const router = express.Router();


// POST /contacts
router.post("/", async (req, res) => {
    try {
        const contact = new Contact(req.body);
        const savedContact = await contact.save();

        res.status(201).json({
            success: true,
            message: "Contact created successfully",
            data: savedContact
        });

    } catch (error) {

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];

            return res.status(409).json({
                success: false,
                message: `${field} already exists`
            });
        }

        if (error.name === "ValidationError") {
            const errors = {};

            Object.keys(error.errors).forEach(field => {
                errors[field] = error.errors[field].message;
            });

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
});


// GET /contacts
router.get("/", async (req, res) => {
    try {
        const contacts = await Contact.find();

        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch contacts",
            error: error.message
        });
    }
});


// GET /contacts/:id
router.get("/:id", async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID"
            });
        }

        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        res.status(200).json({
            success: true,
            data: contact
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch contact",
            error: error.message
        });
    }
});


// PUT /contacts/:id
router.put("/:id", async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID"
            });
        }

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact updated successfully",
            data: contact
        });

    } catch (error) {

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];

            return res.status(409).json({
                success: false,
                message: `${field} already exists`
            });
        }

        if (error.name === "ValidationError") {
            const errors = {};

            Object.keys(error.errors).forEach(field => {
                errors[field] = error.errors[field].message;
            });

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update contact",
            error: error.message
        });
    }
});


// DELETE /contacts/:id
router.delete("/:id", async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID"
            });
        }

        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact deleted successfully",
            data: contact
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete contact",
            error: error.message
        });
    }
});


module.exports = router;