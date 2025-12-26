import json
import random

# Advanced AI Service for NeuroVisa
# Simulates sophisticated LLM logic with state-aware heuristics

class AIService:
    def generate_questions(self, user_profile: dict) -> list:
        visa_type = user_profile.get("visa_type", "General").lower()
        country = user_profile.get("target_country", "USA")
        
        # Base questions every interview should have
        questions_pool = [
            f"What is the primary purpose of your travel to {country}?",
            "How long do you plan to stay in the country?",
            "Can you tell me about your current employment or studies?",
            "Who is funding your trip, and what is their source of income?",
            "What guarantees that you will return to your home country after your stay?"
        ]
        
        # Visa-specific specialized questions
        if "student" in visa_type or "f1" in visa_type:
            questions_pool.extend([
                "Why did you choose this specific university and program?",
                "How does this degree fit into your long-term career plans in your home country?",
                "If you are offered a job in the US after graduation, what would you do?",
                "How will you cover your living expenses in addition to tuition?"
            ])
        elif "work" in visa_type or "h1" in visa_type:
            questions_pool.extend([
                "What specific skills do you possess that make you suitable for this role?",
                "How did you find this employer, and have you met them in person?",
                "What is your expected salary, and how does it compare to your current income?",
                "Tell me about the project you will be working on."
            ])
        elif "tourist" in visa_type or "b1" in visa_type:
            questions_pool.extend([
                "What is your itinerary for the first few days of your trip?",
                "Why are you choosing to travel at this specific time?",
                "Do you have any friends or family at your destination?"
            ])
            
        # Select 5 unique questions
        selected = random.sample(questions_pool, min(5, len(questions_pool)))
        return [{"text": q, "order": i+1} for i, q in enumerate(selected)]

    def evaluate_answer(self, question_text: str, answer_text: str) -> dict:
        """
        Sophisticated heuristic-based evaluation simulating advanced AI analysis.
        Tracks: Red flags, confidence, clarity, and specific risks.
        """
        words = answer_text.lower().split()
        word_count = len(words)
        
        # 1. Red Flag Detection
        red_flags = []
        risky_sentences = []
        
        rejection_triggers = {
            "immigrant_intent": ["stay forever", "not coming back", "find a job there", "live with my boyfriend", "don't like my country"],
            "financial_risk": ["don't know who pays", "no savings", "borrowed money", "work while studying", "unemployed"],
            "weak_ties": ["no family here", "sold my house", "quit my job", "nothing to return to"],
            "vague_purpose": ["just because", "maybe travel", "don't know yet", "see what happens"]
        }
        
        for category, triggers in rejection_triggers.items():
            for trigger in triggers:
                if trigger in answer_text.lower():
                    red_flags.append(category)
                    risky_sentences.append(f"Detected potential {category.replace('_', ' ')}: '{trigger}'")
        
        # 2. Confidence/Clarity Analysis
        hesitations = answer_text.lower().count(" maybe") + answer_text.lower().count(" i think") + answer_text.lower().count(" um")
        confidence_score = max(0, 100 - (hesitations * 15))
        if word_count < 10: confidence_score -= 20
        
        # 3. Overall Scoring Logic
        base_score = 50
        if word_count > 20: base_score += 20
        if word_count > 40: base_score += 15
        
        penalty = len(red_flags) * 25
        final_score = max(5, min(98, base_score + (confidence_score // 5) - penalty))
        
        # 4. Generate Specific Feedback
        if final_score > 85:
            feedback = "Excellent response! You were clear, concise, and demonstrated strong ties to your home country."
        elif final_score > 65:
            feedback = "Good answer, but could be more persuasive. Try to provide concrete details about your return plans or funding."
        else:
            feedback = "This answer might raise concerns. Avoid vague statements and ensure you clearly state your intent to return."
            
        if red_flags:
            feedback += f" Warning: Your response contains signals for {', '.join(set(red_flags))}."

        # 5. Follow-up Question Generation (Adaptive Logic)
        follow_up = None
        if final_score < 70 or red_flags:
            if "immigrant_intent" in red_flags or final_score < 50:
                follow_up = "I see. To be clear, do you have specific commitments or property in your home country that require your return after this trip?"
            elif "financial_risk" in red_flags:
                follow_up = "Thank you. Could you elaborate on how exactly you'll be accessing those funds while abroad? Documentation might be requested."
            elif "vague_purpose" in red_flags or word_count < 10:
                follow_up = "I'd like to understand your itinerary better. Could you describe your plans for the first 48 hours in the country?"
            else:
                follow_up = "That's helpful. Could you clarify one point: how does this visit specifically benefit your current situation at home?"

        return {
            "score": final_score,
            "feedback": feedback,
            "follow_up": follow_up,
            "metrics": {
                "clarity": "High" if word_count > 15 else ("Medium" if word_count > 5 else "Low"),
                "confidence": "High" if confidence_score > 70 else ("Medium" if confidence_score > 40 else "Low"),
                "risk_level": "High" if red_flags or final_score < 50 else ("Medium" if final_score < 75 else "Low"),
                "red_flags": list(set(red_flags)),
                "risky_sentences": risky_sentences[:2],
                "word_count": word_count
            }
        }

ai_service = AIService()
