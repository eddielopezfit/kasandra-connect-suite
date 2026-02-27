import { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, ChevronRight, ChevronLeft, Compass } from "lucide-react";
import { QUIZ_QUESTIONS, scoreQuiz, type NeighborhoodMatch } from "@/lib/neighborhood/quizScoring";
import { logEvent } from "@/lib/analytics/logEvent";
import { updateSessionContext } from "@/lib/analytics/selenaSession";
import QuizResults from "./QuizResults";

interface NeighborhoodQuizProps {
  onExploreZip: (zip: string) => void;
}

const NeighborhoodQuiz = ({ onExploreZip }: NeighborhoodQuizProps) => {
  const { language, t } = useLanguage();
  const [step, setStep] = useState(0); // -1 = not started, 0..N-1 = questions, N = results
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<NeighborhoodMatch[] | null>(null);

  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentQuestion = started ? QUIZ_QUESTIONS[step] : null;
  const progressPercent = started && !results ? ((step) / totalQuestions) * 100 : results ? 100 : 0;

  const handleStart = () => {
    setStarted(true);
    setStep(0);
    setAnswers({});
    setResults(null);
    logEvent("neighborhood_quiz_started", {});
  };

  const handleSelect = useCallback((value: string) => {
    if (!currentQuestion) return;
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (step < totalQuestions - 1) {
      setStep(step + 1);
    } else {
      // Score and show results
      const matches = scoreQuiz(newAnswers, 3);
      setResults(matches);
      
      updateSessionContext({
        quiz_completed: true,
        neighborhood_quiz_top_zip: matches[0]?.zip || null,
      });

      logEvent("neighborhood_quiz_completed", {
        answers: newAnswers,
        top_match_zip: matches[0]?.zip,
        top_match_percent: matches[0]?.matchPercent,
      });
    }
  }, [answers, currentQuestion, step, totalQuestions]);

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleReset = () => {
    setStarted(false);
    setStep(0);
    setAnswers({});
    setResults(null);
  };

  // Intro state
  if (!started) {
    return (
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-cc-gold/15 text-cc-gold-dark px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Compass className="w-4 h-4" />
              {t("Neighborhood Match", "Tu Vecindario Ideal")}
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-navy mb-4">
              {t("Is This Area Right for You?", "¿Es Esta Área Ideal Para Ti?")}
            </h2>
            <p className="text-cc-text-muted mb-8 max-w-lg mx-auto">
              {t(
                "Answer 5 quick questions about your lifestyle and we'll match you with the Tucson neighborhoods that fit best.",
                "Responde 5 preguntas rápidas sobre tu estilo de vida y te conectaremos con los vecindarios de Tucson que mejor se adapten."
              )}
            </p>
            <Button
              onClick={handleStart}
              className="bg-cc-navy hover:bg-cc-navy-dark text-white font-semibold rounded-full px-8 py-3 text-base shadow-elevated"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {t("Find My Neighborhood", "Encontrar Mi Vecindario")}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Results state
  if (results) {
    return (
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <QuizResults
            matches={results}
            onExploreZip={onExploreZip}
            onRetake={handleReset}
          />
        </div>
      </section>
    );
  }

  // Question state
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-cc-text-muted mb-2">
              <span>{t(`Question ${step + 1} of ${totalQuestions}`, `Pregunta ${step + 1} de ${totalQuestions}`)}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-cc-sand [&>div]:bg-cc-gold" />
          </div>

          {/* Question */}
          {currentQuestion && (
            <div className="text-center mb-8">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-2">
                {language === "es" ? currentQuestion.questionEs : currentQuestion.questionEn}
              </h3>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion?.options.map((opt) => {
              const isSelected = answers[currentQuestion.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 font-medium
                    ${isSelected
                      ? "border-cc-gold bg-cc-gold/10 text-cc-navy"
                      : "border-cc-sand-dark/40 bg-cc-sand hover:border-cc-gold/60 hover:bg-cc-gold/5 text-cc-charcoal"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{language === "es" ? opt.labelEs : opt.labelEn}</span>
                    <ChevronRight className={`w-4 h-4 transition-opacity ${isSelected ? "opacity-100 text-cc-gold" : "opacity-30"}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Back button */}
          {step > 0 && (
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-cc-text-muted hover:text-cc-navy"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t("Back", "Atrás")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NeighborhoodQuiz;
