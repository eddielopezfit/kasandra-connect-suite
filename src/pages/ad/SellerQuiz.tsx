import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SellerFunnelLayout from "@/components/ad/SellerFunnelLayout";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";

// Value ranges for calculator
const VALUE_RANGES: Record<string, number> = {
  "under-200k": 175000,
  "200-350k": 275000,
  "350-500k": 425000,
  "over-500k": 600000,
};

interface QuizOption {
  id: string;
  label: string;
  icon: string;
}

interface QuizStep {
  id: string;
  question: string;
  options: QuizOption[];
}

const quizSteps: QuizStep[] = [
  {
    id: "situation",
    question: "What's your situation?",
    options: [
      { id: "inherited", label: "Inherited Property", icon: "🏠" },
      { id: "relocating", label: "Relocating", icon: "✈️" },
      { id: "downsizing", label: "Downsizing", icon: "📦" },
      { id: "other", label: "Other", icon: "💭" },
    ],
  },
  {
    id: "condition",
    question: "How would you describe the property's condition?",
    options: [
      { id: "excellent", label: "Move-in Ready", icon: "✨" },
      { id: "good", label: "Minor Updates Needed", icon: "🔧" },
      { id: "fair", label: "Needs Work", icon: "🛠️" },
      { id: "poor", label: "Major Repairs Required", icon: "🏚️" },
    ],
  },
  {
    id: "timeline",
    question: "What's your ideal timeline to sell?",
    options: [
      { id: "asap", label: "ASAP (1-2 weeks)", icon: "⚡" },
      { id: "soon", label: "Within 30 days", icon: "📅" },
      { id: "flexible", label: "2-3 months", icon: "🗓️" },
      { id: "no-rush", label: "No rush", icon: "🌴" },
    ],
  },
  {
    id: "value",
    question: "What's your estimated home value?",
    options: [
      { id: "under-200k", label: "Under $200K", icon: "💵" },
      { id: "200-350k", label: "$200K - $350K", icon: "💰" },
      { id: "350-500k", label: "$350K - $500K", icon: "💎" },
      { id: "over-500k", label: "Over $500K", icon: "🏆" },
    ],
  },
];

const SellerQuiz = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const progress = ((currentStep + 1) / quizSteps.length) * 100;
  const currentQuestion = quizSteps[currentStep];

  const handleSelect = (optionId: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentStep < quizSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Navigate to results with quiz data
        const params = new URLSearchParams({
          situation: newAnswers.situation || '',
          condition: newAnswers.condition || '',
          timeline: newAnswers.timeline || '',
          value: newAnswers.value || '',
        });
        navigate(`/ad/seller-result?${params.toString()}`);
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/ad/seller");
    }
  };

  return (
    <SellerFunnelLayout>
      <div className="min-h-[calc(100vh-120px)] flex flex-col px-4 py-6">
        {/* Progress Bar */}
        <div className="max-w-xl mx-auto w-full mb-8">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-white/60 hover:text-white transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <span className="text-white/40 text-sm">
              Step {currentStep + 1} of {quizSteps.length}
            </span>
          </div>
          <Progress 
            value={progress} 
            className="h-2 bg-white/10 [&>div]:bg-cc-gold" 
          />
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
          <h2 className="font-serif text-2xl sm:text-3xl text-white text-center mb-8">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`
                  group relative p-6 rounded-2xl border-2 transition-all duration-200
                  ${
                    answers[currentQuestion.id] === option.id
                      ? "border-cc-gold bg-cc-gold/10"
                      : "border-white/20 bg-white/5 hover:border-cc-gold/50 hover:bg-white/10"
                  }
                `}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="text-3xl">{option.icon}</span>
                  <span className="text-white font-medium text-lg">
                    {option.label}
                  </span>
                </div>
                {/* Selected indicator */}
                {answers[currentQuestion.id] === option.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-cc-gold rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-cc-navy" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SellerFunnelLayout>
  );
};

export default SellerQuiz;
