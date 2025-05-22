import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const sanitizeForATS = (text) => {
  if (!text) return text;
  
  // Mapeamento de caracteres especiais para suas versões ASCII
  const replacements = {
    '∑': 'SUM', 
    '≤': '<=',
    '≥': '>=',
    '≠': '!=',
    '―': '-',
    '–': '-',
    '—': '-',
    '“': '"',
    '”': '"',
    '‘': "'",
    '’': "'",
    '…': '...',
    '•': '-',
    '→': '->',
    '←': '<-',
    '±': '+/-',
    'μ': 'u',
    '°': 'deg'
  };
  
  // Substitui caracteres especiais e remove outros não suportados
  return text
    .replace(/[∑≤≥≠―–—“”‘’…•→←±μ°]/g, char => replacements[char] || '')
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, ''); // Remove qualquer caractere não-ASCII
};

function App() {
  // Opções de idioma para a aplicação
  const idiomasApp = [
    { codigo: "pt", nome: "Português", icone: "🇧🇷" },
    { codigo: "en", nome: "English", icone: "🇺🇸" },
    { codigo: "es", nome: "Español", icone: "🇪🇸" },
  ];

  // Textos traduzidos
  const textos = {
    pt: {
      tituloApp: "Gerador de Currículo",
      subtituloApp: "Crie um currículo profissional em minutos",
      dicasATS: "Dicas para um currículo ATS-friendly",
      dicasLista: [
        "Use palavras-chave relevantes para a vaga",
        "Mantenha o formato simples e legível",
        "Inclua métricas e resultados concretos",
        "Destaque suas principais habilidades técnicas"
      ],
      campos: {
        nome: "Nome Completo*",
        cargoDesejado: "Cargo Desejado",
        codigoPais: "Código do País",
        ddd: "DDD",
        telefone: "Telefone",
        cidade: "Cidade",
        linkedin: "LinkedIn",
        portfolio: "Portfolio/GitHub",
        email: "Email*",
        resumo: "Resumo Profissional*",
        experiencia: "Experiência Profissional",
        formacao: "Formação Acadêmica",
        habilidades: "Habilidades Técnicas",
        idiomas: "Idiomas",
        certificacoes: "Certificações",
        tipoFormacao: "Tipo de Formação",
        curso: "Curso*",
        instituicao: "Instituição*",
        periodo: "Período",
        cargo: "Cargo",
        empresa: "Empresa",
        tecnologias: "Tecnologias utilizadas",
        atividades: "Atividades realizadas",
        resultados: "Resultados alcançados (com métricas)",
        idioma: "Idioma",
        nivel: "Nível",
        certificacao: "Certificação"
      },
      placeholders: {
        nome: "Ex: João da Silva",
        cargoDesejado: "Ex: Desenvolvedor Front-end React",
        ddd: "Ex: 11",
        telefone: "Ex: 99999-9999",
        cidade: "Ex: São Paulo, SP",
        linkedin: "seuperfil",
        portfolio: "Ex: github.com/seuuser",
        email: "Ex: seuemail@exemplo.com",
        resumo: "Ex: Desenvolvedor Front-end com 5 anos de experiência em React e TypeScript. Especializado em criar interfaces de usuário responsivas e acessíveis...",
        curso: "Ex: Bacharelado em Ciência da Computação",
        instituicao: "Ex: Universidade de São Paulo",
        periodo: "Ex: 2015 - 2019",
        cargo: "Ex: Desenvolvedor Front-end React",
        empresa: "Ex: Google Inc.",
        tecnologias: "Ex: React, TypeScript, Redux, Node.js",
        atividades: "Descreva suas responsabilidades (1 item por linha)",
        resultados: "Ex: Reduzi o tempo de carregamento em 40% através de...",
        habilidades: "Ex: JavaScript, React, Node.js, HTML/CSS, Git, AWS, Docker",
        idioma: "Ex: Inglês",
        certificacao: "Ex: Certificação AWS Cloud Practitioner"
      },
      botoes: {
        adicionarExperiencia: "Adicionar Experiência",
        adicionarFormacao: "Adicionar Formação",
        adicionarIdioma: "Adicionar Idioma",
        adicionarCertificacao: "Adicionar Certificação",
        gerarCV: "Gerar Currículo em PDF"
      },
      mensagens: {
        nenhumaExperiencia: "Nenhuma experiência adicionada (opcional)",
        nenhumIdioma: "Nenhum idioma adicionado (opcional)",
        nenhumaCertificacao: "Nenhuma certificação adicionada (opcional)",
        sucesso: "Currículo gerado com sucesso!",
        gerando: "Gerando Currículo..."
      },
      secoesPDF: {
        resumo: "RESUMO",
        experiencia: "EXPERIÊNCIA",
        formacao: "FORMAÇÃO",
        habilidades: "HABILIDADES",
        idiomas: "IDIOMAS",
        certificacoes: "CERTIFICAÇÕES"
      },
      niveisIdioma: [
        "Básico", "Intermediário", "Avançado", "Fluente", "Nativo"
      ]
    },
    en: {
      tituloApp: "Resume Generator",
      subtituloApp: "Create a professional resume in minutes",
      dicasATS: "Tips for an ATS-friendly resume",
      dicasLista: [
        "Use relevant keywords for the position",
        "Keep the format simple and readable",
        "Include metrics and concrete results",
        "Highlight your main technical skills"
      ],
      campos: {
        nome: "Full Name*",
        cargoDesejado: "Desired Position",
        codigoPais: "Country Code",
        ddd: "Area Code",
        telefone: "Phone",
        cidade: "City",
        linkedin: "LinkedIn",
        portfolio: "Portfolio/GitHub",
        email: "Email*",
        resumo: "Professional Summary*",
        experiencia: "Professional Experience",
        formacao: "Education",
        habilidades: "Technical Skills",
        idiomas: "Languages",
        certificacoes: "Certifications",
        tipoFormacao: "Education Level",
        curso: "Course*",
        instituicao: "Institution*",
        periodo: "Period",
        cargo: "Position",
        empresa: "Company",
        tecnologias: "Technologies used",
        atividades: "Responsibilities",
        resultados: "Achievements (with metrics)",
        idioma: "Language",
        nivel: "Level",
        certificacao: "Certification"
      },
      placeholders: {
        nome: "Ex: John Smith",
        cargoDesejado: "Ex: React Front-end Developer",
        ddd: "Ex: 212",
        telefone: "Ex: 555-123-4567",
        cidade: "Ex: New York, NY",
        linkedin: "yourprofile",
        portfolio: "Ex: github.com/youruser",
        email: "Ex: your.email@example.com",
        resumo: "Ex: Front-end Developer with 5 years of experience in React and TypeScript. Specialized in creating responsive and accessible user interfaces...",
        curso: "Ex: Bachelor's in Computer Science",
        instituicao: "Ex: University of São Paulo",
        periodo: "Ex: 2015 - 2019",
        cargo: "Ex: React Front-end Developer",
        empresa: "Ex: Google Inc.",
        tecnologias: "Ex: React, TypeScript, Redux, Node.js",
        atividades: "Describe your responsibilities (1 item per line)",
        resultados: "Ex: Reduced loading time by 40% through...",
        habilidades: "Ex: JavaScript, React, Node.js, HTML/CSS, Git, AWS, Docker",
        idioma: "Ex: English",
        certificacao: "Ex: AWS Cloud Practitioner Certification"
      },
      botoes: {
        adicionarExperiencia: "Add Experience",
        adicionarFormacao: "Add Education",
        adicionarIdioma: "Add Language",
        adicionarCertificacao: "Add Certification",
        gerarCV: "Generate PDF Resume"
      },
      mensagens: {
        nenhumaExperiencia: "No experience added (optional)",
        nenhumIdioma: "No languages added (optional)",
        nenhumaCertificacao: "No certifications added (optional)",
        sucesso: "Resume generated successfully!",
        gerando: "Generating Resume..."
      },
      secoesPDF: {
        resumo: "SUMMARY",
        experiencia: "EXPERIENCE",
        formacao: "EDUCATION",
        habilidades: "SKILLS",
        idiomas: "LANGUAGES",
        certificacoes: "CERTIFICATIONS"
      },
      niveisIdioma: [
        "Basic", "Intermediate", "Advanced", "Fluent", "Native"
      ]
    },
    es: {
      tituloApp: "Generador de Currículum",
      subtituloApp: "Crea un currículum profesional en minutos",
      dicasATS: "Consejos para un currículum compatible con ATS",
      dicasLista: [
        "Usa palabras clave relevantes para el puesto",
        "Mantén el formato simple y legible",
        "Incluye métricas y resultados concretos",
        "Destaca tus principales habilidades técnicas"
      ],
      campos: {
        nome: "Nombre Completo*",
        cargoDesejado: "Puesto Deseado",
        codigoPais: "Código de País",
        ddd: "Código de Área",
        telefone: "Teléfono",
        cidade: "Ciudad",
        linkedin: "LinkedIn",
        portfolio: "Portfolio/GitHub",
        email: "Email*",
        resumo: "Resumen Profesional*",
        experiencia: "Experiencia Profesional",
        formacao: "Formación Académica",
        habilidades: "Habilidades Técnicas",
        idiomas: "Idiomas",
        certificacoes: "Certificaciones",
        tipoFormacao: "Nivel de Formación",
        curso: "Curso*",
        instituicao: "Institución*",
        periodo: "Período",
        cargo: "Puesto",
        empresa: "Empresa",
        tecnologias: "Tecnologías utilizadas",
        atividades: "Responsabilidades",
        resultados: "Logros (con métricas)",
        idioma: "Idioma",
        nivel: "Nivel",
        certificacao: "Certificación"
      },
      placeholders: {
        nome: "Ej: Juan Pérez",
        cargoDesejado: "Ej: Desarrollador Front-end React",
        ddd: "Ej: 11",
        telefone: "Ej: 99999-9999",
        cidade: "Ej: Madrid, España",
        linkedin: "tuperfil",
        portfolio: "Ej: github.com/tuusuario",
        email: "Ej: tu.email@ejemplo.com",
        resumo: "Ej: Desarrollador Front-end con 5 años de experiencia en React y TypeScript. Especializado en crear interfaces de usuario responsivas y accesibles...",
        curso: "Ej: Licenciatura en Informática",
        instituicao: "Ej: Universidad de São Paulo",
        periodo: "Ej: 2015 - 2019",
        cargo: "Ej: Desarrollador Front-end React",
        empresa: "Ej: Google Inc.",
        tecnologias: "Ej: React, TypeScript, Redux, Node.js",
        atividades: "Describe tus responsabilidades (1 ítem por línea)",
        resultados: "Ej: Reduje el tiempo de carga en 40% mediante...",
        habilidades: "Ej: JavaScript, React, Node.js, HTML/CSS, Git, AWS, Docker",
        idioma: "Ej: Inglés",
        certificacao: "Ej: Certificación AWS Cloud Practitioner"
      },
      botoes: {
        adicionarExperiencia: "Añadir Experiencia",
        adicionarFormacao: "Añadir Formación",
        adicionarIdioma: "Añadir Idioma",
        adicionarCertificacao: "Añadir Certificación",
        gerarCV: "Generar CV en PDF"
      },
      mensagens: {
        nenhumaExperiencia: "Ninguna experiencia añadida (opcional)",
        nenhumIdioma: "Ningún idioma añadido (opcional)",
        nenhumaCertificacao: "Ninguna certificación añadida (opcional)",
        sucesso: "¡Currículum generado con éxito!",
        gerando: "Generando Currículum..."
      },
      secoesPDF: {
        resumo: "RESUMEN",
        experiencia: "EXPERIENCIA",
        formacao: "FORMACIÓN",
        habilidades: "HABILIDADES",
        idiomas: "IDIOMAS",
        certificacoes: "CERTIFICACIONES"
      },
      niveisIdioma: [
        "Básico", "Intermedio", "Avanzado", "Fluido", "Nativo"
      ]
    }
  };



  const paisesTelefone = [
    { codigo: "+55", nome: "Brasil (+55)" },
    { codigo: "+1", nome: "EUA/Canadá (+1)" },
    { codigo: "+54", nome: "Argentina (+54)" },
    { codigo: "+351", nome: "Portugal (+351)" },
    { codigo: "+34", nome: "Espanha (+34)" },
    { codigo: "+49", nome: "Alemanha (+49)" },
    { codigo: "+33", nome: "França (+33)" },
    { codigo: "+44", nome: "Reino Unido (+44)" },
    { codigo: "+39", nome: "Itália (+39)" },
    { codigo: "+61", nome: "Austrália (+61)" }
  ];

  const tiposCurso = [
    { valor: "superior", label: "Ensino Superior" },
    { valor: "tecnologo", label: "Tecnólogo" },
    { valor: "medio", label: "Ensino Médio" },
    { valor: "tecnico", label: "Técnico" },
    { valor: "pos", label: "Pós-Graduação" },
    { valor: "mestrado", label: "Mestrado" },
    { valor: "doutorado", label: "Doutorado" },
    { valor: "outro", label: "Outro" }
  ];

  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    ddd: "",
    codigoPais: "+55",
    cidade: "",
    email: "",
    linkedin: "",
    portfolio: "",
    cargoDesejado: "",
    resumo: "",
    experiencias: [],
    formacoes: [{ tipo: "superior", curso: "", instituicao: "", periodo: "" }],
    habilidades: [],
    certificacoes: [],
    idiomas: [{ idioma: "", nivel: "" }],
  });

  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [habilidadesInput, setHabilidadesInput] = useState("");
  const [idiomaApp, setIdiomaApp] = useState("pt");
  const [activeSection, setActiveSection] = useState("info");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGenerationAnimation, setShowGenerationAnimation] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Obter textos traduzidos com base no idioma selecionado
  const t = textos[idiomaApp];

  const validateForm = () => {
  const newErrors = {};
  let firstErrorSection = null;
  
  // Validação do nome (seção "info")
  if (!formData.nome.trim()) {
    newErrors.nome = t.campos.nome.replace("*", "") + " é obrigatório";
    if (!firstErrorSection) firstErrorSection = "info";
  }
  
  // Validação do email (seção "info")
  if (!formData.email.trim()) {
    newErrors.email = t.campos.email.replace("*", "") + " é obrigatório";
    if (!firstErrorSection) firstErrorSection = "info";
  } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
    newErrors.email = "Email inválido";
    if (!firstErrorSection) firstErrorSection = "info";
  }
  
  // Validação do resumo (seção "resumo")
  if (!formData.resumo.trim()) {
    newErrors.resumo = t.campos.resumo.replace("*", "") + " é obrigatório";
    if (!firstErrorSection) firstErrorSection = "resumo";
  }
  
  // Validação das formações (seção "formacao")
  formData.formacoes.forEach((form, idx) => {
    if (!form.curso.trim()) {
      newErrors[`formacao_curso_${idx}`] = t.campos.curso.replace("*", "") + " é obrigatório";
      if (!firstErrorSection) firstErrorSection = "formacao";
    }
    if (!form.instituicao.trim()) {
      newErrors[`formacao_instituicao_${idx}`] = t.campos.instituicao.replace("*", "") + " é obrigatória";
      if (!firstErrorSection) firstErrorSection = "formacao";
    }
  });
  
  setErrors(newErrors);
  
  return {
    isValid: Object.keys(newErrors).length === 0,
    firstErrorSection
  };
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, name, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = { ...newArray[index], [name]: value };
      return { ...prev, [field]: newArray };
    });
  };

  const addField = (field, initialValue = "") => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], typeof initialValue === "object" ? { ...initialValue } : initialValue]
    }));
  };

  const removeField = (field, index) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const handleHabilidadesChange = (e) => {
    const value = e.target.value;
    setHabilidadesInput(value);
    
    const habilidadesArray = value.split(",")
      .map(skill => skill.trim())
      .filter(skill => skill);
    
    setFormData(prev => ({ ...prev, habilidades: habilidadesArray }));
  };

  const formatarTextoParaPDF = (text, maxWidth, font, fontSize) => {
  const paragraphs = text.split('\n');
  let lines = [];
  
  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ');
    let currentLine = words[0] || '';
    
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      
      if (width < maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  
  return lines;
};




 const gerarPDF = async (fromModal = false) => {
  const validation = validateForm();
  
  if (!validation.isValid) {
    if (validation.firstErrorSection) {
      setActiveSection(validation.firstErrorSection);
      setTimeout(() => {
        const sectionElement = document.getElementById(validation.firstErrorSection);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    return;
  }
  
  if (!fromModal) {
    // Mostra a animação primeiro
    setShowGenerationAnimation(true);
    
    // Espera 2 segundos para a animação terminar
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Gera o PDF
    setIsGenerating(true);
    try {
  
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // Tamanho A4 em pontos
    const { width, height } = page.getSize();

    // Configurações de fonte e cores
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const black = rgb(0, 0, 0);

    // Margens e layout
    const marginX = 50;
    const marginY = 50;
    const maxWidth = width - 2 * marginX;
    let y = height - marginY;
    const lineHeight = 14;
    const sectionGap = 16;
    const minY = marginY + 50;

    // Função para verificar nova página
    const checkForNewPage = (requiredSpace = lineHeight) => {
      if (y - requiredSpace < minY) {
        page = pdfDoc.addPage([595, 842]);
        y = height - marginY;
        return true;
      }
      return false;
    };

    // Funções auxiliares de desenho
   const drawTitle = (text, size = 16) => {
  const cleanText = sanitizeForATS(text); // <-- Sanitiza antes de desenhar
  checkForNewPage(size + 8);
  page.drawText(cleanText.toUpperCase(), {
    x: marginX,
    y,
    size,
    font: boldFont,
    color: black,
    lineHeight: size * 1.2
  });
  y -= size + 8;
};

const drawSectionHeader = (text, size = 12) => {
  const cleanText = sanitizeForATS(text); // <-- Sanitiza aqui também
  checkForNewPage(size + 6);
  page.drawText(cleanText.toUpperCase(), {
    x: marginX,
    y,
    size,
    font: boldFont,
    color: black,
    lineHeight: size * 1.2
  });
  y -= size + 6;
};

const drawText = (text, indent = 0, size = 11) => {
  const lines = Array.isArray(text) ? text : [text || ''];
  lines.forEach(line => {
    if (line.trim()) {
      const cleanLine = sanitizeForATS(line); // <-- Sanitiza cada linha
      
      const formattedLines = formatarTextoParaPDF(cleanLine, maxWidth - indent, font, size);
      formattedLines.forEach(formattedLine => {
        checkForNewPage(lineHeight);
        page.drawText(formattedLine, {
          x: marginX + indent,
          y,
          size,
          font,
          color: black,
          lineHeight: size * 1.4
        });
        y -= lineHeight;
      });
    }
  });
};

    const drawBullet = (text, indent = 15, size = 11) => {
      checkForNewPage(lineHeight);
      page.drawText("•", {
        x: marginX,
        y: y + 4,
        size: size + 2,
        font,
        color: black,
      });
      drawText(text, indent, size);
    };

    const drawDivider = () => {
      checkForNewPage(sectionGap);
      y -= sectionGap/2;
    };

    // Cabeçalho do currículo
    drawTitle(formData.nome, 18);
    
    if (formData.cargoDesejado) {
      drawSectionHeader(formData.cargoDesejado, 14);
      y -= 4;
    }

    // Informações de contato
    const contactInfo = [
      formData.telefone && `${formData.codigoPais} ${formData.ddd} ${formData.telefone}`,
      formData.email,
      formData.linkedin && `linkedin.com/in/${formData.linkedin}`,
      formData.portfolio && (formData.portfolio.includes('github.com') ? 
                           `github.com/${formData.portfolio.split('github.com/').pop()}` : 
                           formData.portfolio),
      formData.cidade
    ].filter(Boolean).join(" | ");

    drawText(contactInfo, 0, 10);
    drawDivider();

    // Seção de Resumo
    if (formData.resumo) {
      drawSectionHeader(t.secoesPDF.resumo);
      drawText(formData.resumo);
      drawDivider();
    }

    // Seção de Experiência Profissional
    if (formData.experiencias.length > 0) {
      drawSectionHeader(t.secoesPDF.experiencia);
      
      formData.experiencias.forEach((exp, index) => {
        if (exp.cargo || exp.empresa) {
          // Cabeçalho da experiência
          const header = [
            exp.cargo,
            exp.empresa && ` - ${exp.empresa}`,
            exp.periodo && ` (${exp.periodo})`
          ].filter(Boolean).join("");
          
          drawText(header, 0, 12);
          
          // Tecnologias utilizadas
          if (exp.tecnologias) {
            drawText(`Tecnologias: ${exp.tecnologias}`, 0, 10);
            y -= 6;
          }

          // Atividades realizadas
          if (exp.atividades) {
            drawText("Atividades:", 0, 11);
            exp.atividades.split('\n')
              .filter(a => a.trim())
              .forEach(atividade => {
                drawBullet(atividade.trim().replace(/^[-•*]\s*/, ''));
              });
            y -= 6;
          }

          // Resultados alcançados
          if (exp.resultados) {
            drawText("Resultados:", 0, 11);
            exp.resultados.split('\n')
              .filter(r => r.trim())
              .forEach(resultado => {
                drawBullet(resultado.trim().replace(/^[-•*]\s*/, ''));
              });
          }
          
          // Espaço entre experiências
          if (index < formData.experiencias.length - 1) {
            y -= 12;
            drawDivider();
          }
        }
      });
      drawDivider();
    }

    // Seção de Habilidades
    if (formData.habilidades.length > 0) {
      drawSectionHeader(t.secoesPDF.habilidades);
      
      // Agrupar habilidades removendo duplicatas
      const uniqueSkills = [...new Set(formData.habilidades
        .map(s => s.trim())
        .filter(s => s.length > 0))];
      
      uniqueSkills.forEach(skill => {
        drawBullet(skill);
      });
      
      drawDivider();
    }

    // Seção de Formação Acadêmica
    if (formData.formacoes.some(f => f.curso || f.instituicao)) {
      drawSectionHeader(t.secoesPDF.formacao);
      
      formData.formacoes.forEach(form => {
        if (form.curso || form.instituicao) {
          const tipoCurso = tiposCurso.find(t => t.valor === form.tipo)?.label || '';
          const title = [
            tipoCurso && `${tipoCurso} -`,
            form.curso,
            form.instituicao && ` - ${form.instituicao}`,
            form.periodo && ` (${form.periodo})`
          ].filter(Boolean).join(" ");
          
          drawBullet(title);
        }
      });
      drawDivider();
    }

    // Seção de Idiomas
    if (formData.idiomas.some(i => i.idioma)) {
      drawSectionHeader(t.secoesPDF.idiomas);
      
      formData.idiomas.forEach(idioma => {
        if (idioma.idioma) {
          const text = [
            idioma.idioma,
            idioma.nivel && ` (${idioma.nivel})`
          ].filter(Boolean).join("");
          drawBullet(text);
        }
      });
      drawDivider();
    }

    // Seção de Certificações
    if (formData.certificacoes.length > 0) {
      drawSectionHeader(t.secoesPDF.certificacoes);
      
      formData.certificacoes
        .filter(c => c.trim())
        .forEach(cert => {
          drawBullet(cert);
        });
    }

    // Gerar e baixar o PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `CV_${formData.nome.replace(/\s+/g, '_')}_ATS.pdf`;
    link.click();
    
    setSuccessMessage(t.mensagens.sucesso);
    setTimeout(() => setSuccessMessage(""), 3000);
  
    setShowPaymentModal(true);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsGenerating(false);
      setShowGenerationAnimation(false);
    }
  }
};











  const renderExperienceFields = () => {
    return formData.experiencias.map((exp, idx) => (
      <div key={idx} className="mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.cargo}</label>
            <input
              type="text"
              value={exp.cargo}
              onChange={(e) => handleArrayChange("experiencias", idx, "cargo", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.cargo}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.empresa}</label>
            <input
              type="text"
              value={exp.empresa}
              onChange={(e) => handleArrayChange("experiencias", idx, "empresa", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.empresa}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.periodo}</label>
            <input
              type="text"
              value={exp.periodo}
              onChange={(e) => handleArrayChange("experiencias", idx, "periodo", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.periodo}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.tecnologias}</label>
            <input
              type="text"
              value={exp.tecnologias}
              onChange={(e) => handleArrayChange("experiencias", idx, "tecnologias", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.tecnologias}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.atividades}</label>
          <textarea
            value={exp.atividades}
            onChange={(e) => handleArrayChange("experiencias", idx, "atividades", e.target.value)}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            rows={3}
            placeholder={t.placeholders.atividades}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.resultados}</label>
          <textarea
            value={exp.resultados}
            onChange={(e) => handleArrayChange("experiencias", idx, "resultados", e.target.value)}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            rows={3}
            placeholder={t.placeholders.resultados}
          />
        </div>
        
        <button
          type="button"
          onClick={() => removeField("experiencias", idx)}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-red-500 transition-colors"
          title="Remover experiência"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    ));
  };

  const renderEducationFields = () => {
    return formData.formacoes.map((form, idx) => (
      <div key={idx} className="mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.tipoFormacao}</label>
            <select
              value={form.tipo}
              onChange={(e) => handleArrayChange("formacoes", idx, "tipo", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              {tiposCurso.map(tipo => (
                <option key={tipo.valor} value={tipo.valor}>{tipo.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.curso}</label>
            <input
              type="text"
              value={form.curso}
              onChange={(e) => handleArrayChange("formacoes", idx, "curso", e.target.value)}
              className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors[`formacao_curso_${idx}`] ? "border-red-500" : ""
              }`}
              placeholder={t.placeholders.curso}
            />
            {errors[`formacao_curso_${idx}`] && (
              <p className="text-red-500 text-xs mt-2">{errors[`formacao_curso_${idx}`]}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.instituicao}</label>
            <input
              type="text"
              value={form.instituicao}
              onChange={(e) => handleArrayChange("formacoes", idx, "instituicao", e.target.value)}
              className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors[`formacao_instituicao_${idx}`] ? "border-red-500" : ""
              }`}
              placeholder={t.placeholders.instituicao}
            />
            {errors[`formacao_instituicao_${idx}`] && (
              <p className="text-red-500 text-xs mt-2">{errors[`formacao_instituicao_${idx}`]}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.periodo}</label>
            <input
              type="text"
              value={form.periodo}
              onChange={(e) => handleArrayChange("formacoes", idx, "periodo", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.periodo}
            />
          </div>
        </div>
        
        {formData.formacoes.length > 1 && (
          <button
            type="button"
            onClick={() => removeField("formacoes", idx)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-red-500 transition-colors"
            title="Remover formação"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    ));
  };

  const renderLanguageFields = () => {
    return formData.idiomas.map((idioma, idx) => (
      <div key={idx} className="mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.idioma}</label>
            <input
              type="text"
              value={idioma.idioma}
              onChange={(e) => handleArrayChange("idiomas", idx, "idioma", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.idioma}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.nivel}</label>
            <select
              value={idioma.nivel}
              onChange={(e) => handleArrayChange("idiomas", idx, "nivel", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">{t.campos.nivel}</option>
              {t.niveisIdioma.map((nivel, i) => (
                <option key={i} value={nivel}>{nivel}</option>
              ))}
            </select>
          </div>
        </div>

        {formData.idiomas.length > 1 && (
          <button
            type="button"
            onClick={() => removeField("idiomas", idx)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-red-500 transition-colors"
            title="Remover idioma"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header moderno */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{t.tituloApp}</h1>
              <p className="text-blue-100 mt-1 sm:mt-2 text-sm sm:text-base">{t.subtituloApp}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <select
                value={idiomaApp}
                onChange={(e) => setIdiomaApp(e.target.value)}
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white transition-all"
              >
                {idiomasApp.map((idioma) => (
                  <option key={idioma.codigo} value={idioma.codigo} className="text-gray-800">
                    {idioma.icone} {idioma.nome}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => gerarPDF()}
                disabled={isGenerating}
                className={`px-4 sm:px-6 py-2 rounded-full text-white font-medium flex items-center justify-center transition-all ${
                  isGenerating ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg"
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm sm:text-base">{t.mensagens.gerando}</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm sm:text-base">{t.botoes.gerarCV}</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          
        </div>
      </header>


                  {showGenerationAnimation && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white p-8 rounded-xl max-w-md text-center animate-pop-in">
      <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-green-100 rounded-full">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-12 w-12 text-green-500 animate-checkmark"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Currículo Gerado!</h3>
      <p className="text-gray-600 mb-6">Seu currículo ATS-friendly está pronto para download.</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full animate-progress" 
          style={{ animationDuration: '2s' }}
        ></div>
      </div>
    </div>
  </div>
)}


      {/* Navegação por seções */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 overflow-x-auto">
          <div className="flex">
            {[
              { id: "info", label: t.campos.nome.split("*")[0] },
              { id: "resumo", label: t.campos.resumo.split("*")[0] },
              { id: "experiencia", label: t.campos.experiencia },
              { id: "formacao", label: t.campos.formacao },
              { id: "habilidades", label: t.campos.habilidades },
              { id: "idiomas", label: t.campos.idiomas },
              { id: "certificacoes", label: t.campos.certificacoes }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-3 py-3 font-medium text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeSection === section.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg flex items-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>{successMessage}</p>
          </div>
        )}
        
        <form onSubmit={(e) => { e.preventDefault(); gerarPDF(); }} className="space-y-6 sm:space-y-8">
          {/* Seção de Informações Pessoais */}
          <div id="info" className={`space-y-4 sm:space-y-6 ${activeSection !== "info" && "hidden"}`}>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t.campos.nome.split("*")[0]}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.nome}</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.nome ? "border-red-500" : ""
                  }`}
                  placeholder={t.placeholders.nome}
                />
                {errors.nome && <p className="text-red-500 text-xs mt-1 sm:mt-2">{errors.nome}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.cargoDesejado}</label>
                <input
                  type="text"
                  name="cargoDesejado"
                  value={formData.cargoDesejado}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={t.placeholders.cargoDesejado}
                />
              </div>
            </div>
            
            {/* Telefone com DDD e código do país */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.codigoPais}</label>
                <select
                  name="codigoPais"
                  value={formData.codigoPais}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {paisesTelefone.map(pais => (
                    <option key={pais.codigo} value={pais.codigo}>{pais.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.ddd}</label>
                <input
                  type="text"
                  name="ddd"
                  value={formData.ddd}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={t.placeholders.ddd}
                  maxLength="2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.telefone}</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={t.placeholders.telefone}
                />
              </div>
            </div>
            
            {/* Cidade, LinkedIn e Portfolio */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.cidade}</label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={t.placeholders.cidade}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.linkedin}</label>
                <div className="flex">
                  <span className="inline-flex items-center px-2 sm:px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-xs sm:text-sm">
                    linkedin.com/in/
                  </span>
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="flex-1 min-w-0 block w-full p-2 sm:p-3 rounded-none rounded-r-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder={t.placeholders.linkedin}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.portfolio}</label>
                <input
                  type="text"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={t.placeholders.portfolio}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.email}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.email ? "border-red-500" : ""
                }`}
                placeholder={t.placeholders.email}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 sm:mt-2">{errors.email}</p>}
            </div>
          </div>
          
          {/* Resumo Profissional */}
          <div id="resumo" className={`space-y-4 sm:space-y-6 ${activeSection !== "resumo" && "hidden"}`}>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t.campos.resumo}
            </h2>
            <textarea
              name="resumo"
              value={formData.resumo}
              onChange={handleChange}
              className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.resumo ? "border-red-500" : ""
              }`}
              rows={5}
              placeholder={t.placeholders.resumo}
            />
            {errors.resumo && <p className="text-red-500 text-xs mt-1 sm:mt-2">{errors.resumo}</p>}
            <p className="text-xs text-gray-500">{t.placeholders.resumo.split(":")[0]}</p>
          </div>
          
          {/* Experiência Profissional */}
          <div id="experiencia" className={`space-y-4 sm:space-y-6 ${activeSection !== "experiencia" && "hidden"}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t.campos.experiencia}
              </h2>
              <button
                type="button"
                onClick={() => addField("experiencias", { cargo: "", empresa: "", periodo: "", tecnologias: "", atividades: "", resultados: "" })}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                {t.botoes.adicionarExperiencia}
              </button>
            </div>
            
            {formData.experiencias.length > 0 ? (
              renderExperienceFields()
            ) : (
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">{t.mensagens.nenhumaExperiencia}</p>
              </div>
            )}
          </div>
          
          {/* Formação Acadêmica */}
          <div id="formacao" className={`space-y-4 sm:space-y-6 ${activeSection !== "formacao" && "hidden"}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                {t.campos.formacao}
              </h2>
              <button
                type="button"
                onClick={() => addField("formacoes", { tipo: "superior", curso: "", instituicao: "", periodo: "" })}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                {t.botoes.adicionarFormacao}
              </button>
            </div>
            
            {renderEducationFields()}
          </div>
          
          {/* Habilidades Técnicas */}
          <div id="habilidades" className={`space-y-4 sm:space-y-6 ${activeSection !== "habilidades" && "hidden"}`}>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {t.campos.habilidades}
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.placeholders.habilidades.split(":")[0]}</label>
              <input
                type="text"
                value={habilidadesInput}
                onChange={handleHabilidadesChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder={t.placeholders.habilidades}
              />
              <p className="text-xs text-gray-500 mt-1 sm:mt-2">{t.placeholders.habilidades.split(":")[0]}</p>
              
              {/* Preview das habilidades */}
              {formData.habilidades.length > 0 && (
                <div className="mt-3 sm:mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-1 sm:mb-2">Pré-visualização:</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {formData.habilidades.map((skill, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Idiomas */}
          <div id="idiomas" className={`space-y-4 sm:space-y-6 ${activeSection !== "idiomas" && "hidden"}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {t.campos.idiomas}
              </h2>
              <button
                type="button"
                onClick={() => addField("idiomas", { idioma: "", nivel: "" })}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                {t.botoes.adicionarIdioma}
              </button>
            </div>
            
            {formData.idiomas.length > 0 ? (
              renderLanguageFields()
            ) : (
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">{t.mensagens.nenhumIdioma}</p>
              </div>
            )}
          </div>
          
          {/* Certificações */}
          <div id="certificacoes" className={`space-y-4 sm:space-y-6 ${activeSection !== "certificacoes" && "hidden"}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>            {t.campos.certificacoes}
          </h2>
          <button
            type="button"
            onClick={() => addField("certificacoes", "")}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            {t.botoes.adicionarCertificacao}
          </button>
        </div>

        {formData.certificacoes.length > 0 ? (
          formData.certificacoes.map((cert, idx) => (
            <div key={idx} className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100 relative">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.certificacao}</label>
                <input
                  type="text"
                  value={cert}
                  onChange={(e) => {
                    const newCerts = [...formData.certificacoes];
                    newCerts[idx] = e.target.value;
                    setFormData(prev => ({ ...prev, certificacoes: newCerts }));
                  }}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={t.placeholders.certificacao}
                />
              </div>
              
              <button
                type="button"
                onClick={() => removeField("certificacoes", idx)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-red-500 transition-colors"
                title="Remover certificação"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">{t.mensagens.nenhumaCertificacao}</p>
          </div>
        )}
      </div>

      {/* Navegação entre seções */}
      <div className="flex flex-col-reverse sm:flex-row justify-between pt-6 sm:pt-8 border-t border-gray-200 gap-4">
        <button
          type="button"
          onClick={() => {
            const sections = ["info", "resumo", "experiencia", "formacao", "habilidades", "idiomas", "certificacoes"];
            const currentIndex = sections.indexOf(activeSection);
            if (currentIndex > 0) {
              setActiveSection(sections[currentIndex - 1]);
            }
          }}
          disabled={activeSection === "info"}
          className={`flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors ${
            activeSection === "info" ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Anterior
</button>
            
            {activeSection !== "certificacoes" ? (
              <button
                type="button"
                onClick={() => {
                  const sections = ["info", "resumo", "experiencia", "formacao", "habilidades", "idiomas", "certificacoes"];
                  const currentIndex = sections.indexOf(activeSection);
                  if (currentIndex < sections.length - 1) {
                    setActiveSection(sections[currentIndex + 1]);
                  }
                }}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                Próximo
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => gerarPDF()}
                disabled={isGenerating}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-white font-medium flex items-center justify-center transition-all ${
                  isGenerating ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm sm:text-base">{t.mensagens.gerando}</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm sm:text-base">{t.botoes.gerarCV}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </main>



            {/* engraçado que o projeto é open-souce, eu coloco um qr code pra galera ajudar a hospedar essa bomba e tão pensando q é pra pagar kkkkk pra quem fala que front é facil é pq nunca teve que lidar com cliente, meu amigo... */}







{showPaymentModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowPaymentModal(false);
        setShowQRCode(false);
      }
    }}
  >
    <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 shadow-2xl animate-[fadeIn_0.3s_ease-out] border border-gray-200">
      
      {/* Botão X com animação */}
      <button
        onClick={() => {
          setShowPaymentModal(false);
          setShowQRCode(false);
        }}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 focus:outline-none"
        aria-label="Fechar modal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Cabeçalho com ícone */}
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
           2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
           C13.09 3.81 14.76 3 16.5 3 
           19.58 3 22 5.42 22 8.5 
           c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
</svg>

        </div>
        
        <h3 id="modal-title" className="text-2xl font-bold text-gray-800 mb-2">
  Juntos, vamos mais longe!
</h3>
<p className="text-sm text-gray-500">
  Sua contribuição me ajuda a manter este projeto gratuito e a melhorar ainda mais a experiência para todos.
</p>

      </div>

      {/* QR Code com animação de entrada */}
      {showQRCode && (
        <div className="flex flex-col items-center mb-6 animate-[slideUp_0.4s_ease-out]">
          <div className="relative p-2 bg-white rounded-xl shadow-lg ring-2 ring-blue-200/50">
            <img
              src="/qrcode.png"
              alt="QR Code para doação via PIX"
              className="w-44 h-44 object-contain rounded-lg"
            />
            <div className="absolute inset-0 rounded-lg border-2 border-dashed border-blue-200 animate-ping opacity-0 pointer-events-none"></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Escaneie o QR Code</p>
        </div>
      )}

      {/* Mensagem motivacional */}
      <div className={`text-center mb-6 transition-all duration-300 ${showQRCode ? 'opacity-100' : 'opacity-0 h-0'}`}>
        <p className="text-sm text-gray-600">
          Cada doação, por menor que seja, ajuda a manter esse site no ar!
        </p>
      </div>

      {/* Chave PIX (aparece após mostrar QR Code) */}
      {showQRCode && (
        <div className="mb-6 animate-[fadeIn_0.5s_ease-out]">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs font-medium text-blue-800 mb-1">Chave PIX (copiada automaticamente):</p>
            <div className="flex items-center justify-between bg-white p-2 rounded">
              <p className="text-xs font-mono text-gray-700 break-all">80eb8e06-493b-4870-9dfc-47ed230c5d16</p>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Botões com animações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => {
            setShowQRCode(true);
            navigator.clipboard.writeText("80eb8e06-493b-4870-9dfc-47ed230c5d16");
            
            // Feedback visual
            const button = document.getElementById('donate-button');
            if (button) {
              button.classList.add('animate-[pulse_0.5s_ease-in-out]');
              setTimeout(() => {
                button.classList.remove('animate-[pulse_0.5s_ease-in-out]');
              }, 500);
            }
          }}
          id="donate-button"
          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Doar
        </button>

        <button
          onClick={() => {
            window.location.href = "mailto:codegabriel.ti@gmail.com?subject=Reportar%20Erro%20ou%20Sugestão";
            
            // Feedback visual
            const button = document.getElementById('report-button');
            if (button) {
              button.classList.add('animate-[shake_0.5s_ease-in-out]');
              setTimeout(() => {
                button.classList.remove('animate-[shake_0.5s_ease-in-out]');
              }, 500);
            }
          }}
          id="report-button"
          className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Reportar Problema
        </button>
      </div>

      {/* Rodapé */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">Obrigado por fazer parte dessa jornada conosco!</p>
      </div>
    </div>
  </div>
)}

            

  {/* Footer */}
  <footer className="bg-white border-t border-gray-200 py-6 sm:py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-3 sm:space-x-4 mb-4 md:mb-0">
          <a 
            href="https://github.com/codedgabriel/ats-curriculo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="GitHub do projeto"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>
          <a 
            href="https://linkedin.com/in/codegabriel" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-600 transition-colors"
            aria-label="LinkedIn do autor"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        </div>
        <p className="text-xs sm:text-sm text-gray-500">
          Criado por <span className="font-medium text-gray-700">D. Gabriel</span> - {new Date().getFullYear()}
        </p>
      </div>
    </div>
  </footer>
</div>

);
}

export default App;