/**
 * AI Pipeline System - نظام المراحل المتعددة للذكاء الاصطناعي
 * 
 * المراحل:
 * 1. Planning - Cerebras يعمل todo list
 * 2. Thinking - بناء SQL queries وتحديد البيانات المطلوبة
 * 3. Data Fetching - جلب البيانات من Supabase
 * 4. Reading - Deepseek يقرأ ويحلل البيانات
 * 5. Visualization - تحضير الرسومات والمكونات
 * 6. Building - Grok يبني الرد النهائي
 */

import OpenAI from "openai";
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { getAllAIContextData } from './aiContext';
import { getSystemPrompt } from './aiSystemPrompt';
import { getDashboardStats } from "../../services/apiDashboard";
import supabase from "../../services/supabase";

// API Configurations
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const CEREBRAS_API_KEY = import.meta.env.VITE_CEREBRAS_API_KEY;

// Initialize clients
const groqClient = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true
});
const cerebrasClient = new Cerebras({ apiKey: CEREBRAS_API_KEY });

// Pipeline Phases
export const PHASES = {
  IDLE: 'idle',
  PLANNING: 'planning',
  THINKING: 'thinking',
  DATA_FETCHING: 'data_fetching',
  READING: 'reading',
  VISUALIZATION: 'visualization',
  BUILDING: 'building',
  COMPLETE: 'complete',
  ERROR: 'error'
};

// Phase labels in Arabic
export const PHASE_LABELS = {
  [PHASES.IDLE]: 'جاهز',
  [PHASES.PLANNING]: 'بخطط...',
  [PHASES.THINKING]: 'بفكر...',
  [PHASES.DATA_FETCHING]: 'بجيب البيانات...',
  [PHASES.READING]: 'بقرأ البيانات...',
  [PHASES.VISUALIZATION]: 'برسم البيانات...',
  [PHASES.BUILDING]: 'ببني الرد...',
  [PHASES.COMPLETE]: 'خلصت!',
  [PHASES.ERROR]: 'حصل مشكلة'
};

// Phase descriptions
export const PHASE_DESCRIPTIONS = {
  [PHASES.PLANNING]: 'Cerebras بيعمل خطة للرد على سؤالك',
  [PHASES.THINKING]: 'بحدد البيانات اللي محتاجها من الداتابيز',
  [PHASES.DATA_FETCHING]: 'بجيب البيانات من Supabase',
  [PHASES.READING]: 'Deepseek بيحلل البيانات',
  [PHASES.VISUALIZATION]: 'بحضّر الرسومات البيانية والجداول',
  [PHASES.BUILDING]: 'Grok بيجهز الرد النهائي'
};

/**
 * Main Pipeline Class
 */
export class AIPipeline {
  constructor(onPhaseChange, onLog) {
    this.currentPhase = PHASES.IDLE;
    this.onPhaseChange = onPhaseChange || (() => {});
    this.onLog = onLog || console.log;
    this.todoList = null;
    this.fetchedData = null;
    this.analysisResult = null;
    this.aborted = false;
  }

  // Log helper with emoji
  log(message, data = null) {
    const timestamp = new Date().toLocaleTimeString('ar-EG');
    const phaseEmoji = {
      [PHASES.PLANNING]: '📋',
      [PHASES.THINKING]: '🤔',
      [PHASES.DATA_FETCHING]: '📊',
      [PHASES.READING]: '📖',
      [PHASES.VISUALIZATION]: '🎨',
      [PHASES.BUILDING]: '🔨',
      [PHASES.COMPLETE]: '✅',
      [PHASES.ERROR]: '❌'
    };
    
    const emoji = phaseEmoji[this.currentPhase] || '🤖';
    console.log(`${emoji} [${timestamp}] [${this.currentPhase.toUpperCase()}] ${message}`);
    if (data) {
      console.log('📦 Data:', data);
    }
    this.onLog(`${emoji} ${message}`, data);
  }

  // Set phase with callback
  setPhase(phase) {
    this.currentPhase = phase;
    this.log(`المرحلة: ${PHASE_LABELS[phase]}`);
    this.onPhaseChange(phase);
  }

  // Abort the pipeline
  abort() {
    this.aborted = true;
    this.log('تم إلغاء العملية');
  }

  /**
   * Phase 1: PLANNING - Cerebras creates todo list
   */
  async planningPhase(userMessage, context) {
    this.setPhase(PHASES.PLANNING);
    this.log('بدأت مرحلة التخطيط مع Cerebras');

    try {
      const planningPrompt = `
أنت مساعد ذكي لعيادة طبية. المستخدم سأل: "${userMessage}"

اعمل todo list للرد على السؤال ده. القائمة لازم تحتوي على 4 أقسام:

## requests
- ايه الطلبات اللي المستخدم عايزها بالظبط؟

## data
- ايه البيانات اللي محتاجينها من الداتابيز؟
- اكتب اسماء الجداول والحقول المطلوبة

## actions
- ايه الإجراءات اللي هنعملها (لو فيه)؟

## building
- ازاي هنعرض الرد للمستخدم؟
- **مهم جداً:** responseType لازم يكون:
  * "chart" → لو السؤال فيه: رسم بياني، إحصائيات، مقارنة، توضيح بياني, line chart, bar chart
  * "table" → لو السؤال طالب جدول أو قائمة مفصلة
  * "text" → لو سؤال عادي

رد بصيغة JSON فقط:
{
  "requests": ["طلب 1", "طلب 2"],
  "data": {
    "tables": ["اسم الجدول"],
    "fields": ["الحقول المطلوبة"],
    "queries": ["وصف الاستعلام"]
  },
  "actions": ["إجراء 1"],
  "building": {
    "responseType": "chart",
    "chartType": "line|bar|pie",
    "components": ["المكونات المطلوبة"]
  }
}
`;

      // Use Cerebras for planning
      const cerebrasResponse = await cerebrasClient.chat.completions.create({
        model: 'llama-3.3-70b',
        messages: [
          { role: "system", content: "أنت مساعد ذكي لعيادة طبية. رد بصيغة JSON فقط. لو المستخدم طلب رسم بياني أو مقارنة أو إحصائيات، responseType لازم يكون 'chart'." },
          { role: "user", content: planningPrompt }
        ],
        temperature: 0.3,
        max_completion_tokens: 1024
      });
      
      const response = cerebrasResponse.choices[0].message.content;
      
      // Parse JSON from response
      let todoList;
      try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, response];
        const jsonStr = jsonMatch[1] || response;
        todoList = JSON.parse(jsonStr.trim());
      } catch (parseError) {
        this.log('فشل في تحليل JSON، هستخدم قائمة افتراضية', parseError);
        todoList = {
          requests: [userMessage],
          data: { tables: [], fields: [], queries: [] },
          actions: [],
          building: { responseType: 'text', components: [] }
        };
      }

      this.todoList = todoList;
      this.log('خلصت التخطيط', todoList);
      
      // Print TODO list to console for debugging
      console.log('\n📋 ==================== TODO LIST ====================');
      console.log('📝 Requests:', todoList.requests);
      console.log('💾 Data:', todoList.data);
      console.log('⚡ Actions:', todoList.actions);
      console.log('🎨 Building:', todoList.building);
      console.log('🔍 RESPONSE TYPE:', todoList.building?.responseType);
      console.log('🔍 CHART TYPE:', todoList.building?.chartType);
      console.log('📋 ====================================================\n');
      
      return todoList;

    } catch (error) {
      this.log('خطأ في مرحلة التخطيط مع Cerebras، جاري استخدام Groq...', error.message);
      
      // Fallback to Groq if Cerebras fails
      try {
        const groqResponse = await groqClient.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "أنت مساعد ذكي لعيادة طبية. رد بصيغة JSON فقط. لو المستخدم طلب رسم بياني أو مقارنة أو إحصائيات، responseType لازم يكون 'chart'." },
            { role: "user", content: planningPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1024
        });
        
        const response = groqResponse.choices[0].message.content;
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, response];
        const jsonStr = jsonMatch[1] || response;
        
        try {
          this.todoList = JSON.parse(jsonStr.trim());
        } catch {
          this.todoList = {
            requests: [userMessage],
            data: { tables: [], fields: [], queries: [] },
            actions: [],
            building: { responseType: 'text', components: [] }
          };
        }
        
        this.log('خلصت التخطيط (Groq fallback)', this.todoList);
        
        // Print TODO list to console
        console.log('\n📋 ==================== TODO LIST ====================');
        console.log('📝 Requests:', this.todoList.requests);
        console.log('💾 Data:', this.todoList.data);
        console.log('⚡ Actions:', this.todoList.actions);
        console.log('🎨 Building:', this.todoList.building);
        console.log('📋 ====================================================\n');
        
        return this.todoList;
      } catch (groqError) {
        this.log('فشل Groq أيضاً', groqError.message);
        this.todoList = {
          requests: [userMessage],
          data: { tables: [], fields: [], queries: [] },
          actions: [],
          building: { responseType: 'text', components: [] }
        };
        return this.todoList;
      }
    }
  }

  /**
   * Phase 2: THINKING - Build SQL queries
   */
  async thinkingPhase() {
    this.setPhase(PHASES.THINKING);
    this.log('بدأت مرحلة التفكير - بناء استعلامات SQL');

    if (!this.todoList?.data?.tables?.length) {
      this.log('مفيش جداول محددة، هستخدم البيانات الموجودة');
      return null;
    }

    try {
      const dataRequirements = this.todoList.data;
      this.log('البيانات المطلوبة:', dataRequirements);
      
      // Map table names to actual Supabase tables
      const tableMapping = {
        'المرضى': 'patients',
        'patients': 'patients',
        'المواعيد': 'appointments',
        'appointments': 'appointments',
        'الزيارات': 'visits',
        'visits': 'visits',
        'الكشوفات': 'visits',
        'المالية': 'financial_records',
        'financial_records': 'financial_records',
        'الإشعارات': 'notifications',
        'notifications': 'notifications',
        'العيادة': 'clinics',
        'clinics': 'clinics',
        'الخطط': 'patient_plans',
        'patient_plans': 'patient_plans',
        'القوالب': 'treatment_templates',
        'treatment_templates': 'treatment_templates'
      };

      const sqlQueries = dataRequirements.tables.map(table => {
        const actualTable = tableMapping[table.toLowerCase()] || table;
        return {
          table: actualTable,
          originalName: table,
          fields: dataRequirements.fields || ['*']
        };
      });

      this.log('تم بناء الاستعلامات:', sqlQueries);
      return sqlQueries;

    } catch (error) {
      this.log('خطأ في مرحلة التفكير', error.message);
      return null;
    }
  }

  /**
   * Phase 3: DATA FETCHING - Get data from Supabase
   */
  async dataFetchingPhase(sqlQueries) {
    this.setPhase(PHASES.DATA_FETCHING);
    this.log('بدأت مرحلة جلب البيانات من Supabase');

    try {
      // Always get all context data for comprehensive responses
      const allContextData = await getAllAIContextData();
      this.log('تم جلب كل بيانات السياق');

      // Get dashboard stats
      const stats = await getDashboardStats().catch(() => null);
      this.log('تم جلب إحصائيات لوحة التحكم');

      // If specific queries were planned, execute them
      let specificData = {};
      if (sqlQueries && sqlQueries.length > 0) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: userData } = await supabase
            .from('users')
            .select('clinic_id')
            .eq('user_id', session.user.id)
            .single();

          const clinicId = userData?.clinic_id;

          for (const query of sqlQueries) {
            try {
              const { data } = await supabase
                .from(query.table)
                .select(query.fields.join(','))
                .eq('clinic_id', clinicId)
                .limit(50);
              
              specificData[query.table] = data;
              this.log(`تم جلب بيانات ${query.table}:`, { count: data?.length || 0 });
            } catch (err) {
              this.log(`فشل جلب ${query.table}:`, err.message);
            }
          }
        }
      }

      this.fetchedData = {
        context: allContextData,
        stats: stats,
        specific: specificData
      };

      this.log('اكتملت مرحلة جلب البيانات', { 
        hasContext: !!allContextData,
        hasStats: !!stats,
        specificTables: Object.keys(specificData)
      });

      return this.fetchedData;

    } catch (error) {
      this.log('خطأ في مرحلة جلب البيانات', error.message);
      throw error;
    }
  }

  /**
   * Phase 4: READING - Deepseek analyzes data
   */
  async readingPhase(userMessage, userData, clinicData, subscriptionData) {
    this.setPhase(PHASES.READING);
    this.log('بدأت مرحلة القراءة مع Deepseek');

    try {
      const systemPrompt = getSystemPrompt(
        userData, 
        clinicData, 
        subscriptionData, 
        this.fetchedData?.stats,
        this.fetchedData?.context
      );

      const analysisPrompt = `
${systemPrompt}

## البيانات المتاحة:
${JSON.stringify(this.fetchedData, null, 2)}

## خطة العمل:
${JSON.stringify(this.todoList, null, 2)}

## سؤال المستخدم:
${userMessage}

حلل البيانات دي وجهز تحليل شامل يساعد في الرد على السؤال.
اكتب التحليل باللهجة المصرية وبشكل بسيط.
`;

      // Use Deepseek for analysis
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Tabibi AI"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages: [
            { role: "system", content: "أنت محلل بيانات طبية. حلل البيانات واكتب ملخص مفيد." },
            { role: "user", content: analysisPrompt }
          ],
          temperature: 0.5,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Deepseek API error: ${response.status}`);
      }

      const data = await response.json();
      this.analysisResult = data.choices[0].message.content;
      this.log('اكتمل تحليل البيانات');

      return this.analysisResult;

    } catch (error) {
      this.log('خطأ في مرحلة القراءة، جاري استخدام Groq...', error.message);
      
      // Fallback to Groq
      try {
        const response = await groqClient.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "أنت محلل بيانات طبية. حلل البيانات واكتب ملخص مفيد باللهجة المصرية." },
            { role: "user", content: `حلل البيانات دي: ${JSON.stringify(this.fetchedData)}` }
          ],
          temperature: 0.5,
          max_tokens: 1000
        });
        
        this.analysisResult = response.choices[0].message.content;
        return this.analysisResult;
      } catch (groqError) {
        this.log('فشل Groq أيضاً', groqError.message);
        this.analysisResult = "تم جلب البيانات بنجاح";
        return this.analysisResult;
      }
    }
  }

  /**
   * Phase 5: VISUALIZATION - Prepare charts and components
   */
  async visualizationPhase(userMessage, userData, clinicData, subscriptionData) {
    this.setPhase(PHASES.VISUALIZATION);
    this.log('بدأت مرحلة تحضير الرسومات والمكونات');

    try {
      let visualizationType = this.todoList?.building?.responseType;
      this.log(`نوع الرد المطلوب: ${visualizationType}`);

      // AUTO-DETECT: Check if user message contains chart-related keywords
      const chartKeywords = ['رسم', 'مقارنة', 'chart', 'إحصائيات', 'توضيح', 'line', 'bar', 'بيوضح'];
      const hasChartRequest = chartKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
      
      console.log('\n🎨 ==================== VISUALIZATION CHECK ====================');
      console.log('🔍 User Message:', userMessage);
      console.log('🔍 Has Chart Keywords:', hasChartRequest);
      console.log('🔍 Current visualizationType:', visualizationType);
      
      if (hasChartRequest && (!visualizationType || visualizationType === 'text')) {
        this.log('⚠️ اكتشفت طلب رسم بياني تلقائياً!');
        visualizationType = 'chart';
        // Update todo list
        if (this.todoList?.building) {
          this.todoList.building.responseType = 'chart';
        }
        console.log('✅ AUTO-DETECTED: Changed to chart type');
      }
      
      console.log('🔍 Final visualizationType:', visualizationType);
      console.log('🎨 ============================================================\n');

      // Check if visualization is needed
      if (!visualizationType || visualizationType === 'text') {
        this.log('مفيش رسومات مطلوبة، هكمّل عادي');
        return { type: 'text', data: null };
      }

      // Check if we have any numerical data that could be visualized
      const hasData = this.fetchedData && Object.keys(this.fetchedData).length > 0;
      
      if (!hasData) {
        this.log('مفيش بيانات للرسم');
        return { type: 'text', data: null };
      }

      // Prepare visualization data based on type
      if (visualizationType.includes('chart') || visualizationType.includes('رسم')) {
        this.log('بحضّر بيانات الرسم البياني...');
        
        const chartPrompt = `
أنت خبير في تحليل البيانات. المستخدم سأل: "${userMessage}"

## البيانات المتاحة:
${JSON.stringify(this.fetchedData, null, 2)}

جهّز بيانات الرسم البياني بصيغة JSON:
{
  "chartType": "bar",  // استخدم bar للإحصائيات، line للتطور الزمني، pie للنسب
  "title": "عنوان الرسم بالعربي",
  "labels": [أسماء الفئات],
  "datasets": [
    {
      "label": "اسم البيانات",
      "data": [القيم الرقمية],
      "color": "#3b82f6"
    }
  ]
}

**مهم جداً:**
- استخدم البيانات الفعلية من fetchedData
- العناوين بالعربي
- رجّع JSON فقط بدون أي نص إضافي
`;

        // Use Groq for fast visualization data preparation
        try {
          const chartResponse = await groqClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "أنت خبير تحليل بيانات. رد بصيغة JSON فقط." },
              { role: "user", content: chartPrompt }
            ],
            temperature: 0.3,
            max_tokens: 1024
          });

          const response = chartResponse.choices[0].message.content;
          const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, response];
          const jsonStr = jsonMatch[1] || response;
          
          try {
            const chartData = JSON.parse(jsonStr.trim());
            this.log('تم تحضير بيانات الرسم البياني', chartData);
            
            console.log('\n📊 ==================== CHART DATA ====================');
            console.log('📊 Chart Type:', chartData.chartType);
            console.log('📊 Title:', chartData.title);
            console.log('📊 Labels:', chartData.labels);
            console.log('📊 Datasets:', chartData.datasets);
            console.log('📊 ===================================================\n');
            
            return { type: 'chart', data: chartData };
          } catch (parseError) {
            this.log('فشل تحليل JSON للرسم البياني', parseError);
            console.log('❌ CHART DATA PARSE ERROR:', parseError.message);
            return { type: 'text', data: null };
          }
        } catch (error) {
          this.log('خطأ في تحضير الرسم البياني', error.message);
          
          // FALLBACK: Create chart manually from available data
          this.log('⚠️ Groq فشل، هحاول اعمل الرسم يدوي...');
          console.log('⚠️ GROQ FAILED - Attempting manual chart creation');
          
          try {
            // Extract appointment data from context
            const appointments = this.fetchedData?.context?.appointments || [];
            const stats = this.fetchedData?.stats;
            
            // Check if we're asking about bookings by source (clinic vs online)
            const isBookingSourceQuery = userMessage.includes('العيادة') && userMessage.includes('النت');
            
            if (isBookingSourceQuery && appointments.length > 0) {
              // Count bookings by source
              const clinicBookings = appointments.filter(a => a.from === 'clinic').length;
              const onlineBookings = appointments.filter(a => a.from === 'booking').length;
              
              const fallbackChart = {
                chartType: 'bar',
                title: 'مقارنة الحجوزات (عيادة vs نت)',
                labels: ['حجوزات العيادة', 'حجوزات النت'],
                datasets: [
                  {
                    label: 'عدد الحجوزات',
                    data: [clinicBookings, onlineBookings],
                    color: '#3b82f6'
                  }
                ]
              };
              
              console.log('✅ FALLBACK CHART CREATED:', fallbackChart);
              this.log('تم عمل رسم بياني يدوي', fallbackChart);
              return { type: 'chart', data: fallbackChart };
            }
            
            // Fallback: Simple stats chart
            if (stats) {
              const fallbackChart = {
                chartType: 'bar',
                title: 'إحصائيات العيادة',
                labels: ['المرضى', 'الحجوزات', 'المؤكد', 'بالانتظار'],
                datasets: [
                  {
                    label: 'العدد',
                    data: [
                      stats.totalPatients || 0,
                      stats.totalAppointments || 0,
                      stats.confirmedAppointments || 0,
                      stats.pendingAppointments || 0
                    ],
                    color: '#10b981'
                  }
                ]
              };
              
              console.log('✅ FALLBACK STATS CHART CREATED:', fallbackChart);
              this.log('تم عمل رسم إحصائيات يدوي', fallbackChart);
              return { type: 'chart', data: fallbackChart };
            }
          } catch (fallbackError) {
            console.log('❌ FALLBACK CHART CREATION FAILED:', fallbackError.message);
            this.log('فشل عمل الرسم اليدوي', fallbackError.message);
          }
          
          return { type: 'text', data: null };
        }
      } else if (visualizationType.includes('table') || visualizationType.includes('جدول')) {
        this.log('بحضّر بيانات الجدول...');
        
        // Prepare table data from fetchedData
        // This is a simple implementation - can be enhanced
        const tableData = {
          title: "بيانات العيادة",
          headers: ['الفئة', 'العدد'],
          rows: []
        };
        
        this.log('تم تحضير بيانات الجدول', tableData);
        return { type: 'table', data: tableData };
      } else {
        // Mixed or other types
        this.log('نوع مختلط أو غير محدد');
        return { type: 'mixed', data: null };
      }
    } catch (error) {
      this.log('خطأ في مرحلة التصور', error.message);
      return { type: 'text', data: null };
    }
  }

  /**
   * Phase 6: BUILDING - Build final response with streaming (using Grok)
   */
  async buildingPhase(userMessage, messages, userData, clinicData, subscriptionData, visualizationData, onChunk) {
    this.setPhase(PHASES.BUILDING);
    this.log('بدأت مرحلة بناء الرد النهائي مع Grok');

    try {
      // Build prompt with visualization instructions
      let buildPrompt = `أنت مساعد طبي ذكي. 

## التحليل:
${this.analysisResult?.substring(0, 500) || 'تم جلب البيانات'}

## التعليمات:
- رد باللهجة المصرية البسيطة
- اكتب نص بسيط يشرح البيانات
- **لا ترسم رسومات بيانية في النص**
- الرسومات هتتضاف تلقائياً بعد كلامك

السؤال: ${userMessage}`;

      // Use Grok for building (primary)
      try {
        this.log('بستخدم Grok لبناء الرد...');
        
        const stream = await groqClient.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "أنت مساعد طبي. رد باللهجة المصرية بشكل مختصر." },
            { role: "user", content: buildPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          stream: true
        });

        let fullContent = "";
        for await (const chunk of stream) {
          if (this.aborted) break;
          
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            fullContent += text;
            onChunk(text, fullContent);
          }
        }

        // Add visualization as an action after text
        console.log('\n🔨 ==================== BUILDING PHASE ====================');
        console.log('🔍 Visualization Data Type:', visualizationData?.type);
        console.log('🔍 Has Chart Data:', !!visualizationData?.data);
        
        if (visualizationData?.type === 'chart' && visualizationData.data) {
          const chartAction = `\n\n[CHART:${JSON.stringify(visualizationData.data)}]`;
          fullContent += chartAction;
          console.log('✅ APPENDED CHART TAG');
          console.log('📊 Chart Action:', chartAction.substring(0, 200) + '...');
          onChunk(chartAction, fullContent);
        } else if (visualizationData?.type === 'table' && visualizationData.data) {
          const tableAction = `\n\n[TABLE:${JSON.stringify(visualizationData.data)}]`;
          fullContent += tableAction;
          console.log('✅ APPENDED TABLE TAG');
          onChunk(tableAction, fullContent);
        } else {
          console.log('⚠️ NO CHART/TABLE TAG APPENDED');
          console.log('⚠️ Reason: type=' + visualizationData?.type + ', hasData=' + !!visualizationData?.data);
        }
        console.log('🔨 ========================================================\n');

        this.log('اكتمل بناء الرد مع Grok', { length: fullContent.length });
        this.setPhase(PHASES.COMPLETE);
        return fullContent;
      } catch (grokError) {
        this.log('خطأ في Grok، جاري استخدام Deepseek...', grokError.message);
        throw grokError; // Will be caught by outer catch
      }

    } catch (error) {
      this.log('خطأ في مرحلة البناء، جاري استخدام Deepseek...', error.message);
      
      // Fallback to Deepseek streaming with simplified prompt
      try {
        // Even more simplified for Deepseek
        const simplePrompt = `التحليل: ${this.analysisResult?.substring(0, 300) || 'بيانات متاحة'}

رد على: ${userMessage}

اكتب رد بسيط باللهجة المصرية.`;

        const response = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Tabibi AI",
            "Accept": "text/event-stream"
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat",
            messages: [
              { role: "system", content: "أنت مساعد طبي. رد بإيجاز." },
              { role: "user", content: simplePrompt }
            ],
            temperature: 0.7,
            max_tokens: 1500,
            stream: true
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Deepseek API error: ${response.status} - ${errorText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        try {
          while (true) {
            if (this.aborted) {
              reader.cancel();
              break;
            }

            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                try {
                  const data = JSON.parse(line.substring(6));
                  if (data.choices?.[0]?.delta?.content) {
                    const text = data.choices[0].delta.content;
                    fullContent += text;
                    onChunk(text, fullContent);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        // Add visualization for Deepseek fallback too
        if (visualizationData?.type === 'chart' && visualizationData.data) {
          const chartAction = `\n\n[CHART:${JSON.stringify(visualizationData.data)}]`;
          fullContent += chartAction;
          onChunk(chartAction, fullContent);
        } else if (visualizationData?.type === 'table' && visualizationData.data) {
          const tableAction = `\n\n[TABLE:${JSON.stringify(visualizationData.data)}]`;
          fullContent += tableAction;
          onChunk(tableAction, fullContent);
        }

        this.log('اكتمل بناء الرد مع Deepseek', { length: fullContent.length });
        this.setPhase(PHASES.COMPLETE);
        return fullContent;
      } catch (deepseekError) {
        this.log('فشل Deepseek أيضاً', deepseekError.message);
        
        // Final fallback - return a simple message with visualization
        let fallbackMessage = `تم تحليل البيانات بنجاح. ${this.analysisResult?.substring(0, 200) || 'البيانات متاحة للعرض.'}`;
        
        if (visualizationData?.type === 'chart' && visualizationData.data) {
          fallbackMessage += `\n\n[CHART:${JSON.stringify(visualizationData.data)}]`;
        } else if (visualizationData?.type === 'table' && visualizationData.data) {
          fallbackMessage += `\n\n[TABLE:${JSON.stringify(visualizationData.data)}]`;
        }
        
        onChunk(fallbackMessage, fallbackMessage);
        this.setPhase(PHASES.COMPLETE);
        return fallbackMessage;
      }
    }
  }

  /**
   * Run the full pipeline
   */
  async run(userMessage, messages, userData, clinicData, subscriptionData, onChunk) {
    this.aborted = false;
    this.log('=== بداية Pipeline ===');
    this.log(`السؤال: ${userMessage}`);

    try {
      // Phase 1: Planning
      await this.planningPhase(userMessage, { userData, clinicData });
      if (this.aborted) return null;

      // Phase 2: Thinking
      const sqlQueries = await this.thinkingPhase();
      if (this.aborted) return null;

      // Phase 3: Data Fetching
      await this.dataFetchingPhase(sqlQueries);
      if (this.aborted) return null;

      // Phase 4: Reading
      await this.readingPhase(userMessage, userData, clinicData, subscriptionData);
      if (this.aborted) return null;

      // Phase 5: Visualization
      const visualizationData = await this.visualizationPhase(userMessage, userData, clinicData, subscriptionData);
      if (this.aborted) return null;

      // Phase 6: Building
      const response = await this.buildingPhase(
        userMessage, 
        messages, 
        userData, 
        clinicData, 
        subscriptionData,
        visualizationData,
        onChunk
      );

      this.log('=== انتهاء Pipeline بنجاح ===');
      return response;

    } catch (error) {
      this.setPhase(PHASES.ERROR);
      this.log('=== فشل Pipeline ===', error.message);
      throw error;
    }
  }
}

/**
 * Create a new pipeline instance
 */
export function createPipeline(onPhaseChange, onLog) {
  return new AIPipeline(onPhaseChange, onLog);
}

export default AIPipeline;
