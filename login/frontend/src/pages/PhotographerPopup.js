import { useState } from "react";
import axios from "axios"; // Import axios for API calls
import "./PhotographerPopup.css";

const steps = [
    { title: "📷 Step 1: Choose Photography Type", key: "photographyType", options: ["Wedding", "Birthday", "Commercial", "Portrait", "Fashion", "Pre-wedding", "Event"] },
    { title: "💰 Step 2: Select Budget", key: "budgetRange", options: ["₹15,000-₹30,000", "₹30,000-₹50,000", "₹50,000-₹80,000", "₹80,000+"] },
    { title: "📁 Step 3: Choose Format", key: "formats", options: ["Digital Files", "Printed Album", "Video", "Combined Package"] },
    { title: "📅 Step 4: Select Date", key: "date", type: "date" },
    { title: "📞 Step 5: Enter Your Contact Number", key: "contactNumber", type: "text" },
    { title: "✅ Step 6: Final Decision", key: "decision", options: ["Likely", "Not Sure", "Confirmed"] },
    { title: "📍 Step 7: Enter Your Location", key: "location", type: "text" },
    { title: "🏠 Step 8: Enter Your PIN Code", key: "pinCode", type: "pin" },
    { title: "🎉 Step 9: Thank You! Your booking is saved." }
];

function PhotographerPopup({ onClose, onSubmit }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState("");

    const handleNext = async () => {
        // Validate current step
        const currentField = steps[currentStep].key;
        
        if (currentStep < steps.length - 1 && !formData[currentField] && currentField) {
            setError("Please fill out this field before continuing.");
            return;
        }
        
        // Additional validation for PIN code
        if (currentField === 'pinCode' && formData.pinCode) {
            const pinCodePattern = /^\d{6}$/;  // 6-digit PIN code
            if (!pinCodePattern.test(formData.pinCode)) {
                setError("Please enter a valid 6-digit PIN code.");
                return;
            }
        }
        
        // Additional validation for contact number
        if (currentField === 'contactNumber' && formData.contactNumber) {
            const contactNumberPattern = /^\d{10}$/;  // 10-digit contact number
            if (!contactNumberPattern.test(formData.contactNumber)) {
                setError("Please enter a valid 10-digit contact number.");
                return;
            }
        }
        
        setError("");

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            console.log("✅ Final Booking Data:", formData);

            try {
                // Pass the form data to parent component
                onSubmit(formData);
            } catch (error) {
                console.error("Error handling form submission:", error);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setError("");
        }
    };

    const handleChange = (key, value) => {
        // For pin code, only allow numbers and limit to 6 digits
        if (key === 'pinCode') {
            value = value.replace(/\D/g, '').slice(0, 6);
        }
        
        // For contact number, only allow numbers and limit to 10 digits
        if (key === 'contactNumber') {
            value = value.replace(/\D/g, '').slice(0, 10);
        }
        
        setFormData({ ...formData, [key]: value });
        setError("");
    };

    // Handle clicking outside popup to close
    const handleOverlayClick = (e) => {
        if (e.target.className === 'popup-overlay') {
            onClose();
        }
    };

    const isLastStep = currentStep === steps.length - 1;

    return (
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup">
                <button className="close-button" onClick={onClose}>&times;</button>
                
                <div className="progress-bar">
                    <div 
                        className="progress" 
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    ></div>
                </div>

                <h3>{steps[currentStep].title}</h3>

                {error && <p className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</p>}

                {steps[currentStep].options ? (
                    <select 
                        onChange={(e) => handleChange(steps[currentStep].key, e.target.value)}
                        value={formData[steps[currentStep].key] || ""}
                    >
                        <option value="">Select {steps[currentStep].key}</option>
                        {steps[currentStep].options.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                ) : steps[currentStep].type === "date" ? (
                    <input 
                        type="date" 
                        onChange={(e) => handleChange(steps[currentStep].key, e.target.value)} 
                        value={formData[steps[currentStep].key] || ""}
                    />
                ) : steps[currentStep].type === "pin" ? (
                    <div>
                        <input
                            type="text"
                            placeholder="Enter 6-digit PIN code for your area"
                            onChange={(e) => handleChange(steps[currentStep].key, e.target.value)}
                            value={formData[steps[currentStep].key] || ""}
                            maxLength={6}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            style={{ marginBottom: '8px' }}
                        />
                        <p style={{ fontSize: '0.85rem', color: '#6c757d', margin: '0' }}>
                            <i className="fas fa-info-circle mr-1"></i> PIN code helps photographers find sessions in their area
                        </p>
                    </div>
                ) : steps[currentStep].type === "text" ? (
                    <div>
                        {steps[currentStep].key === "contactNumber" ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="Enter your 10-digit contact number"
                                    onChange={(e) => handleChange(steps[currentStep].key, e.target.value)}
                                    value={formData[steps[currentStep].key] || ""}
                                    maxLength={10}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    style={{ marginBottom: '8px' }}
                                />
                                <p style={{ fontSize: '0.85rem', color: '#6c757d', margin: '0' }}>
                                    <i className="fas fa-info-circle mr-1"></i> Please enter a valid 10-digit mobile number
                                </p>
                            </>
                        ) : (
                            <input
                                type="text"
                                placeholder="Enter location"
                                onChange={(e) => handleChange(steps[currentStep].key, e.target.value)}
                                value={formData[steps[currentStep].key] || ""}
                            />
                        )}
                    </div>
                ) : null}

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    {currentStep > 0 && !isLastStep && (
                        <button 
                            style={{ 
                                flex: '1', 
                                padding: '12px', 
                                backgroundColor: '#f0f0f0',
                                color: '#333',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }} 
                            onClick={handlePrevious}
                        >
                            Back
                        </button>
                    )}
                    
                    <button 
                        className="next-button" 
                        onClick={handleNext}
                        style={{ flex: isLastStep || currentStep === 0 ? '1' : '2' }}
                    >
                        {isLastStep ? "Finish" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PhotographerPopup;