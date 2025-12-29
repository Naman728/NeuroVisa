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

    def evaluate_answer(self, question_text: str, answer_text: str, stress_mode: bool = False, personality: str = "Neutral") -> dict:
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
        hesitations = answer_text.lower().count(" maybe") + answer_text.lower().count(" i think") + answer_text.lower().count(" um") + answer_text.lower().count(" uh")
        confidence_score = max(0, 100 - (hesitations * 15))
        if word_count < 10: confidence_score -= 20
        
        # 3. Overall Scoring Logic
        base_score = 50
        if word_count > 20: base_score += 15
        if word_count > 40: base_score += 15
        
        penalty = len(red_flags) * 25
        if stress_mode: penalty += 10 # Stress mode is stricter

        final_score = max(5, min(98, base_score + (confidence_score // 5) - penalty))
        
        # 4. Generate Specific Feedback with Adaptive Tone
        # Supportive vs Shaper
        tone_prefix = ""
        if personality == "Friendly":
            tone_prefix = "I appreciate your response. " if final_score > 60 else "I understand, but let's clarify. "
        elif personality == "Strict":
            tone_prefix = "Duly noted. " if final_score > 80 else "Be very precise here. "
            
        if final_score > 85:
            feedback = f"{tone_prefix}Excellent response! You were clear, concise, and demonstrated strong ties to your home country."
        elif final_score > 65:
            feedback = f"{tone_prefix}Good answer, but could be more persuasive. Provide concrete details about your plans."
        else:
            feedback = f"{tone_prefix}This answer raises concerns. Ensure you clearly state your intent to return and avoid vague statements."
            
        if red_flags:
            feedback += f" Warning: System detected {', '.join(set(red_flags))} triggers."

        # 5. Follow-up Question Generation (Adaptive Logic)
        follow_up = None
        if final_score < 70 or red_flags:
            if "immigrant_intent" in red_flags or final_score < 50:
                follow_up = "I see. To be clear, do you have specific commitments or property in your home country that require your return?"
            elif "financial_risk" in red_flags:
                follow_up = "Thank you. Could you elaborate on how exactly you'll be accessing those funds while abroad?"
            elif "vague_purpose" in red_flags or word_count < 10:
                follow_up = "I'd like to understand your itinerary better. Describe your plans for the first 48 hours."
            else:
                follow_up = "How does this visit specifically benefit your current situation at home?"
        
        if stress_mode and not follow_up:
            # Stress mode adds an extra push
            follow_up = "Are you absolutely sure about these details? Any inconsistency could be problematic."

        return {
            "score": final_score,
            "feedback": feedback,
            "follow_up": follow_up,
            "metrics": {
                "clarity": "High" if word_count > 20 else ("Medium" if word_count > 10 else "Low"),
                "confidence": "High" if confidence_score > 75 else ("Medium" if confidence_score > 45 else "Low"),
                "risk_level": "High" if red_flags or final_score < 50 else ("Medium" if final_score < 75 else "Low"),
                "red_flags": list(set(red_flags)),
                "risky_sentences": risky_sentences[:2],
                "word_count": word_count,
                "tone": "Supportive" if confidence_score < 50 else "Direct"
            }
        }

    def generate_improvement_plan(self, session_data: dict) -> dict:
        """
        Analyzes session history and generates a targeted improvement plan.
        """
        # Heuristic: Find lowest scoring answers
        weaknesses = []
        recommendations = []
        
        # Simple analysis
        score = session_data.get("score", 0)
        if score < 70:
            weaknesses.append("Foundational Trust: Some answers lacked concrete evidentiary ties.")
        
        # Examples
        return {
            "top_weaknesses": weaknesses or ["None detected! Your profile is strong."],
            "improved_answers": [
                {"original": "I just want to visit.", "improved": "I am traveling to attend my sister's graduation and explore the national parks for 12 days."},
                {"original": "My dad pays.", "improved": "My father, who is a Senior Architect at [Company], is sponsoring my trip with an allocated budget of $8,000."}
            ],
            "practice_focus": "Specific Detail Articulation"
        }

ai_service = AIService()
