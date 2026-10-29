import { BookingPage } from "./pages/BookingPage";
import { PropertiesPage } from "./pages/PropertiesPage";
import { PropertyPage } from "./pages/PropertyPage";
import { navigate, usePath } from "./router";

export function App() {
  const path = usePath();
  const property = /^\/properties\/([\w-]+)$/.exec(path);
  const booking = /^\/bookings\/([\w-]+)$/.exec(path);

  return (
    <main>
      <header>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          Подобова оренда
        </a>
      </header>
      {property ? (
        <PropertyPage id={property[1]!} />
      ) : booking ? (
        <BookingPage id={booking[1]!} />
      ) : (
        <PropertiesPage />
      )}
    </main>
  );
}
