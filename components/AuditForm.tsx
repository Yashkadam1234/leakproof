"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { AuditInput, Tool, UseCase } from "@/types";

import { TOOLS_CATALOG } from "@/lib/audit-engine";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "audit-form-state";

interface AuditFormProps {
  onSubmit: (inputs: AuditInput[], teamSize: number) => void;
}

interface LocalFormState {
  inputs: AuditInput[];
  teamSize: number;
  primaryUseCase: UseCase;
}

const DEFAULT_USE_CASE: UseCase = "coding";

export default function AuditForm({
  onSubmit,
}: AuditFormProps) {
  const [inputs, setInputs] = useState<AuditInput[]>([]);
  const [teamSize, setTeamSize] = useState<number>(5);
  const [primaryUseCase, setPrimaryUseCase] =
    useState<UseCase>(DEFAULT_USE_CASE);

  const [selectedToolId, setSelectedToolId] =
    useState<string>("");

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  /**
   * Restore persisted form state on mount.
   */
  const hasRestoredRef = useRef(false);

  /**
   * Restore persisted form state on mount.
   * Disabling the lint rule here because restoring
   * from localStorage on mount is a valid use case.
   * The ref guard prevents cascading renders.
   */
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as LocalFormState;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (parsed.inputs) setInputs(parsed.inputs);

      if (parsed.teamSize) setTeamSize(parsed.teamSize);

      if (parsed.primaryUseCase) setPrimaryUseCase(parsed.primaryUseCase);
    } catch (error) {
      console.error("Failed to restore audit form state", error);
    }
  }, []);
  /**
   * Persist every meaningful state change.
   */
  useEffect(() => {
    const payload: LocalFormState = {
      inputs,
      teamSize,
      primaryUseCase,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(payload)
    );
  }, [inputs, teamSize, primaryUseCase]);

  /**
   * Live subtotal used in the UI.
   */
  const subtotal = useMemo(() => {
    return inputs.reduce(
      (sum, input) => sum + input.monthlySpend,
      0
    );
  }, [inputs]);

  /**
   * Only show tools not already selected.
   */
  const availableTools = useMemo(() => {
    const activeToolIds = new Set(
      inputs.map((item) => item.toolId)
    );

    return TOOLS_CATALOG.filter(
      (tool) => !activeToolIds.has(tool.id)
    );
  }, [inputs]);

  function addTool() {
    if (!selectedToolId) {
      return;
    }

    const tool = TOOLS_CATALOG.find(
      (item) => item.id === selectedToolId
    );

    if (!tool) {
      return;
    }

    const defaultPlan = tool.plansAvailable[0];

    const newInput: AuditInput = {
      toolId: tool.id,
      planId: defaultPlan.id,
      monthlySpend:
        defaultPlan.pricePerSeat > 0
          ? defaultPlan.pricePerSeat
          : 1,
      seats: 1,
      useCase: primaryUseCase,
    };

    setInputs((prev) => [...prev, newInput]);

    setSelectedToolId("");
  }

  function removeTool(toolId: string) {
    setInputs((prev) =>
      prev.filter((item) => item.toolId !== toolId)
    );
  }

  function updateInput(
    toolId: string,
    field: keyof AuditInput,
    value: string | number
  ) {
    setInputs((prev) =>
      prev.map((item) =>
        item.toolId === toolId
          ? {
            ...item,
            [field]: value,
          }
          : item
      )
    );
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    inputs.forEach((input) => {
      if (input.monthlySpend <= 0) {
        nextErrors[input.toolId] =
          "Monthly spend must be greater than $0.";
      }

      if (input.seats < 1) {
        nextErrors[input.toolId] =
          "Seat count must be at least 1.";
      }
    });

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit(inputs, teamSize);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <Card className="border border-neutral-200 shadow-sm">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Audit your AI tooling spend
            </h2>

            <p className="text-sm text-muted-foreground">
              See where your team may be
              overspending on AI subscriptions,
              duplicate tools, or enterprise plans
              that no longer fit your usage.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="team-size">
                Total team size
              </Label>

              <Input
                id="team-size"
                type="number"
                min={1}
                value={teamSize}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTeamSize(Number(e.target.value))
                }
              />

              <p className="text-xs text-muted-foreground">
                Used to evaluate whether team
                plans make financial sense.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Primary use case</Label>

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    "coding",
                    "writing",
                    "data",
                    "research",
                    "mixed",
                  ] as UseCase[]
                ).map((useCase) => (
                  <button
                    key={useCase}
                    type="button"
                    onClick={() =>
                      setPrimaryUseCase(useCase)
                    }
                    className={`rounded-lg border px-3 py-2 text-sm capitalize transition ${primaryUseCase === useCase
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 bg-white hover:bg-neutral-50"
                      }`}
                  >
                    {useCase}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-neutral-200 shadow-sm">
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <Label>Add a tool</Label>

              <select
                value={selectedToolId}
                onChange={(e) =>
                  setSelectedToolId(
                    e.target.value
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">
                  Select a tool
                </option>

                {availableTools.map((tool) => (
                  <option
                    key={tool.id}
                    value={tool.id}
                  >
                    {tool.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              onClick={addTool}
              disabled={!selectedToolId}
            >
              Add another tool
            </Button>
          </div>

          {inputs.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No tools added yet. Start by
              selecting the AI tools your team
              currently pays for.
            </div>
          )}

          <div className="grid gap-4">
            {inputs.map((input) => {
              const tool = TOOLS_CATALOG.find(
                (item) => item.id === input.toolId
              ) as Tool;

              return (
                <Card
                  key={input.toolId}
                  className="border border-neutral-200"
                >
                  <CardContent className="space-y-5 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium">
                          {tool.name}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                          Configure your current
                          subscription details.
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          removeTool(
                            input.toolId
                          )
                        }
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Current plan</Label>

                        <select
                          value={input.planId}
                          onChange={(e) =>
                            updateInput(
                              input.toolId,
                              "planId",
                              e.target.value
                            )
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {tool.plansAvailable.map(
                            (plan) => (
                              <option
                                key={plan.id}
                                value={plan.id}
                              >
                                {plan.name}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Monthly spend ($)
                        </Label>

                        <Input
                          type="number"
                          min={1}
                          value={
                            input.monthlySpend
                          }
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateInput(
                              input.toolId,
                              "monthlySpend",
                              Number(
                                e.target.value
                              )
                            )
                          }
                        />
                      </div>

                      {tool.plansAvailable.find(
                        (p) => p.id === input.planId
                      )?.billingType !== "usage_based" && (
                          <div className="space-y-2">
                            <Label>Seats</Label>
                            <Input
                              type="number"
                              min={1}
                              value={input.seats}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                updateInput(input.toolId, "seats", Number(e.target.value))
                              }
                            />
                          </div>
                        )}
                    </div>

                    {errors[input.toolId] && (
                      <p className="text-sm text-red-500">
                        {errors[input.toolId]}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-neutral-200 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Estimated monthly AI tooling spend
            </p>

            <h3 className="text-3xl font-semibold tracking-tight">
              ${subtotal.toFixed(2)}
            </h3>
          </div>

          <Button
            type="submit"
            disabled={inputs.length === 0}
            className="h-11 px-6"
          >
            Generate audit report
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}