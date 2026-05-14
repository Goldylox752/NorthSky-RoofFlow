import SwiftUI
import ClerkKit

struct ContentView: View {
    @Environment(Clerk.self) private var clerk

    var body: some View {
        Group {
            if clerk.isLoaded {
                if let user = clerk.user {
                    VStack(spacing: 16) {
                        Text("Signed In")
                            .font(.headline)

                        Text("Hello, \(user.id)")
                            .font(.body)

                        Button("Sign Out") {
                            Task {
                                try? await clerk.signOut()
                            }
                        }
                    }
                    .padding()

                } else {
                    VStack(spacing: 16) {
                        Text("You are signed out")

                        Button("Sign In") {
                            Task {
                                try? await clerk.presentSignIn()
                            }
                        }
                    }
                    .padding()
                }

            } else {
                ProgressView("Loading...")
            }
        }
    }
}