from app.models.biometrics import BiometricProfile

class RecommendationEngine:
    @staticmethod
    def get_recommendations(profile: BiometricProfile):
        recommendations = {
            "colors": [],
            "styles": [],
            "tips": []
        }
        
        if not profile:
            return recommendations

        # 1. Color Analysis (Simplified)
        if profile.undertone == "Warm":
            recommendations["colors"] = ["Cream", "Olive", "Mustard", "Warm Red", "Gold"]
            recommendations["tips"].append("Earth tones look great on you!")
        elif profile.undertone == "Cool":
            recommendations["colors"] = ["Navy", "Black", "White", "Royal Blue", "Silver"]
            recommendations["tips"].append("Jewel tones enhance your complexion.")
        else: # Neutral
            recommendations["colors"] = ["Dusty Pink", "Jade", "Teal", "Taupe"]
            recommendations["tips"].append("You can pull off almost any color!")

        # 2. Body Shape Analysis (Simplified)
        if profile.body_shape == "Hourglass":
            recommendations["styles"] = ["Wrap Dresses", "High-waisted Trousers", "Belted Coats"]
            recommendations["tips"].append("Accentuate your waist.")
        elif profile.body_shape == "Rectangle":
            recommendations["styles"] = ["Ruffled Tops", "A-line Skirts", "Layered Outfits"]
            recommendations["tips"].append("Create curves with volume.")
        elif profile.body_shape == "Triangle": # Pear
            recommendations["styles"] = ["Boat Neck Tops", "Wide-leg Pants", "Statement Necklaces"]
            recommendations["tips"].append("Draw attention to your upper body.")
            
        # 3. Face Shape Analysis
        if profile.face_shape == "Oval":
            recommendations["tips"].append("Most eyewear shapes suit you.")
        elif profile.face_shape == "Square":
            recommendations["tips"].append("Round glasses soften your features.")

        return recommendations
