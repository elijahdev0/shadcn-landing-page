import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  MessageCircle,
  // Users, // No longer needed directly here, FaWhatsapp will be used
  CalendarDays,
  MapPin,
  CheckSquare,
  Sparkles,
  Lock,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Send, // For sent message indicator (optional)
  Drumstick,
  FishIcon, // Lucide's fish icon
  Carrot,   // For vegetarian
  PencilLine, // For message input simulation
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa"; // Import FaWhatsapp
import { useState, useEffect, useRef } from "react";

// Animation Variants
const phoneVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
};

const lockScreenNotificationVariants = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, delay: 1.0 } }, // Delayed for lock screen to appear first
  exit: { y: -100, opacity: 0, transition: { duration: 0.3 } },
};

const appScreenVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.2, duration: 0.4 } }, // Slight delay for lock screen to exit
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const messageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const buttonGroupVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, delay: 0.4 } }, 
  exit: { opacity: 0, transition: { duration: 0.2 }},
};

const formInputVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.3 }},
}

export const HeroCards = () => {
  const [showLockScreen, setShowLockScreen] = useState(true);
  const [showLockScreenNotification, setShowLockScreenNotification] = useState(false);
  const [showAppScreen, setShowAppScreen] = useState(false);
  const [appInteractionStep, setAppInteractionStep] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const outerContainerRef = useRef<HTMLDivElement>(null); // Ref for the main outer div
  const phoneMockupRef = useRef<HTMLDivElement>(null); // Ref for the phone motion.div

  useEffect(() => {
    const logDimensions = () => {
      if (outerContainerRef.current) {
        console.log('[HeroCards Dimensions] Outer Container:', {
          width: outerContainerRef.current.offsetWidth,
          height: outerContainerRef.current.offsetHeight,
        });
      }
      if (phoneMockupRef.current) {
        console.log('[HeroCards Dimensions] Phone Mockup:', {
          width: phoneMockupRef.current.offsetWidth,
          height: phoneMockupRef.current.offsetHeight,
        });
      }
    };

    logDimensions(); // Log on mount and subsequent updates

    // Optional: Log on resize if you want to debug responsiveness dynamically
    window.addEventListener('resize', logDimensions);
    return () => window.removeEventListener('resize', logDimensions);
  }, [appInteractionStep]); // Re-log if interaction step changes, as layout might be affected

  const openNotificationAndApp = () => {
    setShowLockScreenNotification(false);
    setShowLockScreen(false);
    setShowAppScreen(true);
    setTimeout(() => setAppInteractionStep('initialInvite'), 500);
  };

  useEffect(() => {
    const timerLockNotif = setTimeout(() => {
        if (showLockScreen) {
            setShowLockScreenNotification(true);
        }
    }, 1200);
    
    let timerOpenApp: NodeJS.Timeout | undefined = undefined;
    if (showLockScreenNotification && appInteractionStep === "") {
        timerOpenApp = setTimeout(openNotificationAndApp, 3000);
    }

    return () => {
      clearTimeout(timerLockNotif);
      if (timerOpenApp) clearTimeout(timerOpenApp);
    };
  }, [showLockScreen, showLockScreenNotification, appInteractionStep]);

  const simulateRsvpYes = () => setAppInteractionStep('rsvpSent');
  const simulateMealChoice = (mealText: string) => {
    setSelectedMeal(mealText);
    setAppInteractionStep('mealChoiceSent');
  };
  const simulateSendMessage = () => setAppInteractionStep('finalMessageSent');

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    if (appInteractionStep === 'initialInvite') {
      timeoutId = setTimeout(simulateRsvpYes, 2500);
    } else if (appInteractionStep === 'rsvpSent') {
      timeoutId = setTimeout(() => setAppInteractionStep('showingMealChoice'), 1500);
    } else if (appInteractionStep === 'showingMealChoice') {
      timeoutId = setTimeout(() => simulateMealChoice("Chicken"), 2500);
    } else if (appInteractionStep === 'mealChoiceSent') {
      timeoutId = setTimeout(() => setAppInteractionStep('showingLeaveMessagePrompt'), 1500);
    } else if (appInteractionStep === 'showingLeaveMessagePrompt') {
      timeoutId = setTimeout(simulateSendMessage, 3000);
    } else if (appInteractionStep === 'finalMessageSent') {
      timeoutId = setTimeout(() => setAppInteractionStep('thankYouNote'), 1200);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [appInteractionStep]);

  useEffect(() => {
    console.log(`[HeroCards] appInteractionStep changed to: ${appInteractionStep}`);
    const scrollTimer = setTimeout(() => {
      if (chatContainerRef.current) {
        const chatDiv = chatContainerRef.current;
        console.log('[HeroCards] Attempting to scroll. Current state:', {
          scrollHeight: chatDiv.scrollHeight,
          scrollTop: chatDiv.scrollTop,
          clientHeight: chatDiv.clientHeight,
          appInteractionStep: appInteractionStep
        });
        chatDiv.scrollTop = chatDiv.scrollHeight;
        console.log('[HeroCards] Scrolled. New scrollTop:', chatDiv.scrollTop, 'Target scrollHeight:', chatDiv.scrollHeight);
      } else {
        console.log('[HeroCards] chatContainerRef.current is null, cannot scroll. appInteractionStep:', appInteractionStep);
      }
    }, 350); // Delay to wait for message animation and DOM update

    return () => {
      console.log(`[HeroCards] Clearing scrollTimer for appInteractionStep: ${appInteractionStep}`);
      clearTimeout(scrollTimer);
    };
  }, [appInteractionStep]); // Re-run when new messages are triggered

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const mealChoices = [
    { text: "Chicken", icon: <Drumstick size={16} className="mr-1.5" />, choiceKey: "Chicken" },
    { text: "Seafood", icon: <FishIcon size={16} className="mr-1.5" />, choiceKey: "Seafood" },
    { text: "Vegetarian", icon: <Carrot size={16} className="mr-1.5" />, choiceKey: "Vegetarian" },
  ];

  const initialQuickReplies = [
    { text: "🎉 Yes, I'll be there!", icon: <ThumbsUp size={14} />, color: "bg-green-500" }, 
    { text: "😔 Can't make it", icon: <ThumbsDown size={14} />, color: "bg-red-500" },
    { text: "🤔 Maybe", icon: <HelpCircle size={14} />, color: "bg-yellow-500" },
  ];

  return (
    <div ref={outerContainerRef} className="flex justify-center items-center relative w-full lg:w-[700px] lg:h-[500px] select-none py-10 lg:py-0">
      <motion.div
        ref={phoneMockupRef}
        className="relative w-full max-w-[320px] h-[70vh] max-h-[560px] lg:w-72 lg:h-[30rem] bg-gray-800 dark:bg-gray-900 rounded-[2.5rem] border-[8px] lg:border-[10px] border-gray-700 dark:border-gray-800 shadow-2xl overflow-hidden"
        variants={phoneVariants}
        initial="initial"
        animate="animate"
      >
        <div className="absolute inset-0 rounded-[1.8rem] flex flex-col bg-black">
          <AnimatePresence>
            {showLockScreen && (
              <motion.div 
                key="lockScreen"
                className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-purple-800 dark:from-indigo-900 dark:to-purple-950 rounded-[1.8rem] p-4 flex flex-col items-center justify-center text-white z-20"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
              >
                <Lock size={20} className="mb-4 opacity-80" />
                <div className="text-5xl font-semibold opacity-90">{getCurrentTime()}</div>
                <div className="text-sm opacity-70 mt-1">Swipe up to unlock</div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showLockScreenNotification && (
              <motion.div 
                key="lockScreenNotification"
                className="absolute top-20 left-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-30"
                variants={lockScreenNotificationVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-emerald-500 rounded-full flex items-center justify-center w-6 h-6">
                    <FaWhatsapp size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white">Sophia & Liam</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">You're invited to our wedding! 🎉</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- WhatsApp App Screen Layer --- */}
          <AnimatePresence>
            {showAppScreen && (
              <motion.div
                key="appScreen"
                className="absolute inset-0 bg-slate-100 dark:bg-slate-950 rounded-[1.8rem] flex flex-col z-10"
                variants={appScreenVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {/* Top Bar - Simplified WhatsApp look */}
                <div className="bg-emerald-500 dark:bg-emerald-700 p-3 flex items-center justify-between rounded-t-[1.7rem] flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <FaWhatsapp size={20} className="text-white" />
                    <span className="text-white font-semibold text-sm">WhatsApp</span>
                  </div>
                  <Smartphone size={18} className="text-white opacity-70" />
                </div>

                {/* Main Chat Area - Mimics WhatsApp background, centers content */}
                <div ref={chatContainerRef} className="flex-grow p-3 overflow-y-auto relative bg-[#E5DDD5] dark:bg-[#0a1014] flex flex-col space-y-2">
                  <AnimatePresence>
                    {/* Initial Invitation Message */}
                    {(appInteractionStep === 'initialInvite' || appInteractionStep === 'rsvpSent' || appInteractionStep === 'showingMealChoice' || appInteractionStep === 'mealChoiceSent' || appInteractionStep === 'showingLeaveMessagePrompt' || appInteractionStep === 'finalMessageSent' || appInteractionStep === 'thankYouNote') && (
                      <motion.div
                        key="invitationInApp"
                        className="bg-white dark:bg-[#202c33] p-3 rounded-lg shadow-md space-y-3 w-full max-w-xs my-2 self-center"
                        variants={messageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <div className="text-center">
                          <Sparkles className="mx-auto text-yellow-500 dark:text-yellow-400 mb-1" size={28} />
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">You're Invited!</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Join us to celebrate the wedding of</p>
                          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 my-1">Sophia & Liam</p>
                        </div>

                        <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-200">
                          <div className="flex items-center"><CalendarDays size={14} className="mr-2 text-emerald-500 dark:text-emerald-400" /> Saturday, Oct 26th, 2024</div>
                          <div className="flex items-center"><MapPin size={14} className="mr-2 text-emerald-500 dark:text-emerald-400" /> The Grand Ballroom</div>
                        </div>
                        
                        {appInteractionStep === 'initialInvite' && (
                          <motion.div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/30 space-y-1.5 flex flex-col items-stretch" variants={buttonGroupVariants} initial="initial" animate="animate" exit="exit">
                            {initialQuickReplies.map(reply => (
                              <div key={reply.text} className={`w-full text-white text-xs py-2 px-3 rounded-md flex items-center justify-center space-x-1.5 shadow-sm text-center ${reply.color}`}>
                                {reply.icon}<span>{reply.text}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* User's "Yes" RSVP Message */}
                  {(appInteractionStep === 'rsvpSent' || appInteractionStep === 'showingMealChoice' || appInteractionStep === 'mealChoiceSent' || appInteractionStep === 'showingLeaveMessagePrompt' || appInteractionStep === 'finalMessageSent' || appInteractionStep === 'thankYouNote') && (
                    <motion.div
                      key="userRsvpYes"
                      className="bg-[#dcf8c6] dark:bg-[#056162] p-2.5 rounded-lg shadow-sm text-sm text-gray-800 dark:text-gray-100 max-w-[70%] self-end flex items-center"
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <span>🎉 Yes, I'll be there!</span>
                      <CheckSquare size={14} className="ml-1.5 text-blue-500 opacity-70" />
                    </motion.div>
                  )}
                  
                  {/* Host's Meal Choice Question */}
                  {(appInteractionStep === 'showingMealChoice' || appInteractionStep === 'mealChoiceSent' || appInteractionStep === 'showingLeaveMessagePrompt' || appInteractionStep === 'finalMessageSent' || appInteractionStep === 'thankYouNote') && (
                    <motion.div
                      key="mealChoiceQuestion"
                      className="bg-white dark:bg-[#202c33] p-3 rounded-lg shadow-md text-sm text-gray-800 dark:text-gray-100 max-w-[85%] self-start"
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <p>Great! So glad you can make it. 😊</p>
                      <p className="mt-1">To help us with catering, please let us know your meal preference:</p>
                      {/* Meal Choice Buttons - Only show if meal choice not yet sent */}
                      {appInteractionStep === 'showingMealChoice' && (
                        <motion.div className="mt-2.5 space-y-1.5 flex flex-col items-stretch" variants={buttonGroupVariants} initial="initial" animate="animate" exit="exit">
                          {mealChoices.map(meal => (
                             <div key={meal.choiceKey} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs py-2 px-3 rounded-md flex items-center justify-center space-x-1.5 shadow-sm text-center border border-gray-300 dark:border-gray-600">
                                {meal.icon}<span>{meal.text}</span>
                              </div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* User's Meal Choice Message */}
                  {(appInteractionStep === 'mealChoiceSent' || appInteractionStep === 'showingLeaveMessagePrompt' || appInteractionStep === 'finalMessageSent' || appInteractionStep === 'thankYouNote') && selectedMeal && (
                    <motion.div
                      key="userMealChoice"
                      className="bg-[#dcf8c6] dark:bg-[#056162] p-2.5 rounded-lg shadow-sm text-sm text-gray-800 dark:text-gray-100 max-w-[70%] self-end flex items-center"
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <span>{selectedMeal} for me, thanks!</span>
                      <CheckSquare size={14} className="ml-1.5 text-blue-500 opacity-70" />
                    </motion.div>
                  )}

                  {/* Host's "Leave a Message" Prompt */}
                  {(appInteractionStep === 'showingLeaveMessagePrompt' || appInteractionStep === 'finalMessageSent' || appInteractionStep === 'thankYouNote') && (
                    <motion.div
                      key="leaveMessagePrompt"
                      className="bg-white dark:bg-[#202c33] p-3 rounded-lg shadow-md text-sm text-gray-800 dark:text-gray-100 max-w-[85%] self-start"
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <p>Got it! Thanks. 😊</p>
                      <p className="mt-1">And finally, would you like to leave a message for us with your RSVP?</p>
                      {/* Simulated Text Input and Send Button - Only show if message not yet sent */}
                      {appInteractionStep === 'showingLeaveMessagePrompt' && (
                        <motion.div
                          className="mt-2.5 space-y-2"
                          variants={formInputVariants}
                          initial="initial"
                          animate="animate"
                        >
                          <div className="w-full bg-gray-100 dark:bg-gray-700 p-2.5 rounded-md text-gray-500 dark:text-gray-400 text-xs flex items-center">
                            <PencilLine size={14} className="mr-2 opacity-70"/>
                            <span>Type your message here...</span>
                          </div>
                          <div className="w-full bg-emerald-500 text-white text-xs py-2 px-3 rounded-md flex items-center justify-center space-x-1.5 shadow-sm transition-colors">
                            <Send size={14}/>
                            <span>Send Message</span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                  
                  {/* User's Final Message (Simulated) */}
                  {(appInteractionStep === 'finalMessageSent' || appInteractionStep === 'thankYouNote') && (
                    <motion.div
                      key="userFinalMessage"
                      className="bg-[#dcf8c6] dark:bg-[#056162] p-2.5 rounded-lg shadow-sm text-sm text-gray-800 dark:text-gray-100 max-w-[70%] self-end flex items-center"
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <span>Can't wait for the big day! 🥳</span>
                      <CheckSquare size={14} className="ml-1.5 text-blue-500 opacity-70" />
                    </motion.div>
                  )}

                  {/* Host's Thank You Note */}
                  {appInteractionStep === 'thankYouNote' && (
                    <motion.div
                      key="hostThankYou"
                      className="bg-white dark:bg-[#202c33] p-3 rounded-lg shadow-md text-sm text-gray-800 dark:text-gray-100 max-w-[85%] self-start"
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <p>Thank you for RSVPing! We're so excited to celebrate with you. ❤️</p>
                    </motion.div>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
