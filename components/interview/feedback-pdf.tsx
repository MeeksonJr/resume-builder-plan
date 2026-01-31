"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

// Register fonts if needed, but Helvetica is standard
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: "Helvetica",
        color: "#1f2937"
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        paddingBottom: 20
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 8
    },
    metadata: {
        fontSize: 10,
        color: "#6b7280",
        marginBottom: 4
    },
    section: {
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#111827",
        textTransform: "uppercase",
        letterSpacing: 0.5
    },
    contentBox: {
        backgroundColor: "#f9fafb",
        padding: 12,
        borderRadius: 4,
        marginBottom: 10
    },
    questionText: {
        fontSize: 12,
        fontStyle: "italic",
        lineHeight: 1.4
    },
    answerText: {
        fontSize: 11,
        lineHeight: 1.5
    },
    scoreSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        padding: 15,
        borderRadius: 6,
        marginBottom: 20
    },
    scoreBox: {
        alignItems: "center"
    },
    scoreValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#2563eb"
    },
    scoreLabel: {
        fontSize: 10,
        textTransform: "uppercase",
        color: "#4b5563"
    },
    table: {
        display: "flex",
        width: "auto",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 4,
        marginTop: 10
    },
    tableRow: {
        margin: "auto",
        flexDirection: "row"
    },
    tableColLabel: {
        width: "25%",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderLeftWidth: 0,
        borderTopWidth: 0
    },
    tableColValue: {
        width: "75%",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderLeftWidth: 0,
        borderTopWidth: 0
    },
    tableCell: {
        margin: 5,
        fontSize: 10
    },
    highlightTitle: {
        fontSize: 11,
        fontWeight: "bold",
        marginTop: 5,
        marginBottom: 2
    },
    text: {
        fontSize: 11,
        lineHeight: 1.4,
        marginBottom: 4
    }
});

interface EvaluationResult {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    scores: {
        situation: number;
        task: number;
        action: number;
        result: number;
    };
    star_breakdown: {
        situation: string;
        task: string;
        action: string;
        result: string;
    };
}

interface FeedbackPDFProps {
    data: {
        question: string;
        answer: string;
        date: string;
        feedback: EvaluationResult;
        type: string;
    };
}

const FeedbackDocument = ({ data }: FeedbackPDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Interview Feedback Analysis</Text>
                <Text style={styles.metadata}>Generated on {format(new Date(), "MMMM d, yyyy")}</Text>
                <Text style={styles.metadata}>Session Type: {data.type}</Text>
            </View>

            {/* Score Overview */}
            <View style={styles.scoreSection}>
                <View style={styles.scoreBox}>
                    <Text style={styles.scoreValue}>{data.feedback.score}/10</Text>
                    <Text style={styles.scoreLabel}>Overall Score</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                    <View style={styles.scoreBox}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{data.feedback.scores.situation}</Text>
                        <Text style={styles.scoreLabel}>Situation</Text>
                    </View>
                    <View style={styles.scoreBox}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{data.feedback.scores.task}</Text>
                        <Text style={styles.scoreLabel}>Task</Text>
                    </View>
                    <View style={styles.scoreBox}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{data.feedback.scores.action}</Text>
                        <Text style={styles.scoreLabel}>Action</Text>
                    </View>
                    <View style={styles.scoreBox}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{data.feedback.scores.result}</Text>
                        <Text style={styles.scoreLabel}>Result</Text>
                    </View>
                </View>
            </View>

            {/* Question & Answer */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Question</Text>
                <View style={styles.contentBox}>
                    <Text style={styles.questionText}>{data.question}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Answer</Text>
                <Text style={styles.metadata}>Duration: Not recorded • {format(new Date(data.date), "MMM d, h:mm a")}</Text>
                <View style={{ ...styles.contentBox, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" }}>
                    <Text style={styles.answerText}>{data.answer}</Text>
                </View>
            </View>

            {/* STAR Analysis */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>STAR Analysis</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={styles.tableColLabel}>
                            <Text style={styles.tableCell}>Situation</Text>
                        </View>
                        <View style={styles.tableColValue}>
                            <Text style={styles.tableCell}>{data.feedback.star_breakdown.situation}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.tableColLabel}>
                            <Text style={styles.tableCell}>Task</Text>
                        </View>
                        <View style={styles.tableColValue}>
                            <Text style={styles.tableCell}>{data.feedback.star_breakdown.task}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.tableColLabel}>
                            <Text style={styles.tableCell}>Action</Text>
                        </View>
                        <View style={styles.tableColValue}>
                            <Text style={styles.tableCell}>{data.feedback.star_breakdown.action}</Text>
                        </View>
                    </View>
                    <View style={{ ...styles.tableRow, borderBottomWidth: 0 }}>
                        <View style={{ ...styles.tableColLabel, borderBottomWidth: 0 }}>
                            <Text style={styles.tableCell}>Result</Text>
                        </View>
                        <View style={{ ...styles.tableColValue, borderBottomWidth: 0 }}>
                            <Text style={styles.tableCell}>{data.feedback.star_breakdown.result}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detailed Feedback</Text>
                <Text style={styles.text}>{data.feedback.feedback}</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 20 }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ ...styles.sectionTitle, color: '#16a34a', fontSize: 12 }}>Strengths</Text>
                    {data.feedback.strengths.map((s, i) => (
                        <Text key={i} style={styles.text}>• {s}</Text>
                    ))}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ ...styles.sectionTitle, color: '#dc2626', fontSize: 12 }}>Improvements</Text>
                    {data.feedback.improvements.map((s, i) => (
                        <Text key={i} style={styles.text}>• {s}</Text>
                    ))}
                </View>
            </View>

        </Page>
    </Document>
);

export function FeedbackPDFButton({ data, variant = "outline" }: { data: FeedbackPDFProps['data'], variant?: "default" | "outline" | "ghost" }) {
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return (
        <PDFDownloadLink
            document={<FeedbackDocument data={data} />}
            fileName={`interview-feedback-${format(new Date(), "yyyy-MM-dd")}.pdf`}
        >
            {({ blob, url, loading, error }) => (
                <Button variant={variant} size="sm" disabled={loading} className="gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {loading ? "Preparing PDF..." : "Download PDF"}
                </Button>
            )}
        </PDFDownloadLink>
    );
}
