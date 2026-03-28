"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type AdminOperationStatus = "running" | "success" | "error";

type AdminOperationItem = {
  id: string;
  title: string;
  message: string;
  status: AdminOperationStatus;
};

type AdminOperationContextValue = {
  startOperation: (title: string, message: string) => string;
  updateOperation: (id: string, message: string) => void;
  finishOperation: (id: string, message?: string) => void;
  failOperation: (id: string, message: string) => void;
};

const AdminOperationContext = createContext<AdminOperationContextValue | null>(null);

function createOperationId() {
  return `op_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function AdminOperationProvider({ children }: { children: ReactNode }) {
  const [operations, setOperations] = useState<AdminOperationItem[]>([]);
  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const clearExistingTimeout = useCallback((id: string) => {
    const current = timeoutsRef.current[id];
    if (current) {
      clearTimeout(current);
      delete timeoutsRef.current[id];
    }
  }, []);

  const removeOperation = useCallback(
    (id: string) => {
      clearExistingTimeout(id);
      setOperations((current) => current.filter((item) => item.id !== id));
    },
    [clearExistingTimeout],
  );

  const queueRemoval = useCallback(
    (id: string, delayMs: number) => {
      clearExistingTimeout(id);
      timeoutsRef.current[id] = setTimeout(() => {
        removeOperation(id);
      }, delayMs);
    },
    [clearExistingTimeout, removeOperation],
  );

  const startOperation = useCallback((title: string, message: string) => {
    const id = createOperationId();
    setOperations((current) => [
      {
        id,
        title,
        message,
        status: "running",
      },
      ...current.filter((item) => item.status !== "running").slice(0, 2),
    ]);
    return id;
  }, []);

  const updateOperation = useCallback(
    (id: string, message: string) => {
      setOperations((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                message,
                status: "running",
              }
            : item,
        ),
      );
    },
    [],
  );

  const finishOperation = useCallback(
    (id: string, message = "A művelet sikeresen befejeződött.") => {
      setOperations((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                message,
                status: "success",
              }
            : item,
        ),
      );
      queueRemoval(id, 2600);
    },
    [queueRemoval],
  );

  const failOperation = useCallback(
    (id: string, message: string) => {
      setOperations((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                message,
                status: "error",
              }
            : item,
        ),
      );
      queueRemoval(id, 4200);
    },
    [queueRemoval],
  );

  const value = useMemo<AdminOperationContextValue>(
    () => ({
      startOperation,
      updateOperation,
      finishOperation,
      failOperation,
    }),
    [failOperation, finishOperation, startOperation, updateOperation],
  );

  return (
    <AdminOperationContext.Provider value={value}>
      {children}

      <div className="soho-admin-operations" aria-live="polite" aria-atomic="false">
        {operations.map((operation) => (
          <article
            key={operation.id}
            className={`soho-admin-operation-card is-${operation.status}`}
          >
            <div className="soho-admin-operation-icon" aria-hidden="true">
              <span />
            </div>
            <div className="soho-admin-operation-copy">
              <strong>{operation.title}</strong>
              <span>{operation.message}</span>
            </div>
          </article>
        ))}
      </div>
    </AdminOperationContext.Provider>
  );
}

export function useAdminOperations() {
  const context = useContext(AdminOperationContext);

  if (!context) {
    throw new Error("useAdminOperations must be used within AdminOperationProvider.");
  }

  return context;
}
